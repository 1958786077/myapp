import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';
// Draggable is free; InertiaPlugin is a Club plugin we won't rely on
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Draggable from 'gsap/Draggable';

interface Post {
  id: number;
  type: 'portfolio' | 'blog' | 'thoughts';
  title: string;
  content: string;
  image?: string;
  date: string;
}

export default function Gallery() {
  const [portfolioItems, setPortfolioItems] = useState<Post[]>([]);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const splitScreenRef = useRef<HTMLDivElement | null>(null);
  const imageTitleOverlayRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const controlsContainerRef = useRef<HTMLDivElement | null>(null);
  const soundToggleRef = useRef<HTMLButtonElement | null>(null);

  // gsap config and state
  const configRef = useRef({
    itemSize: 320,
    baseGap: 16,
    rows: 8,
    cols: 12,
    currentZoom: 0.6,
    currentGap: 32
  });
  const gridStateRef = useRef({
    width: 0,
    height: 0,
    scaledWidth: 0,
    scaledHeight: 0,
    gap: 32
  });
  const zoomStateRef = useRef({
    isActive: false,
    selectedEl: null as HTMLElement | null,
    selectedImg: null as HTMLImageElement | null,
    overlay: null as HTMLDivElement | null,
    flip: null as gsap.core.Tween | null,
    currentIndex: 0
  });
  const draggableRef = useRef<any>(null);
  const velocitySamplesRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const inertiaTweenRef = useRef<gsap.core.Tween | null>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number; currentScale: number } | null>(null);

  useEffect(() => {
    const storedPosts = typeof window !== 'undefined' && localStorage.getItem('posts');
    if (storedPosts) {
      const posts: Post[] = JSON.parse(storedPosts);
      setPortfolioItems(posts.filter(p => p.type === 'portfolio'));
    }
  }, []);

  useEffect(() => {
    // Register GSAP plugins once
    gsap.registerPlugin(Flip, CustomEase, Draggable);
  }, []);

  // 直接设置预加载完成，跳过加载动画
  useEffect(() => {
    setPreloaderDone(true);
  }, []);

  useEffect(() => {
    if (!portfolioItems.length || !preloaderDone) return;

    const viewport = document.getElementById('viewport');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const gridContainer = document.getElementById('gridContainer');
    const splitScreenContainer = document.getElementById('splitScreenContainer');
    const imageTitleOverlay = document.getElementById('imageTitleOverlay');
    const closeButton = document.getElementById('closeButton') as HTMLButtonElement | null;
    const controlsContainer = document.getElementById('controlsContainer');

    viewportRef.current = viewport as HTMLDivElement | null;
    canvasWrapperRef.current = canvasWrapper as HTMLDivElement | null;
    gridContainerRef.current = gridContainer as HTMLDivElement | null;
    splitScreenRef.current = splitScreenContainer as HTMLDivElement | null;
    imageTitleOverlayRef.current = imageTitleOverlay as HTMLDivElement | null;
    closeButtonRef.current = closeButton;
    controlsContainerRef.current = controlsContainer as HTMLDivElement | null;

    const config = configRef.current;
    // 与 PC 保持一致的网格配置，避免真机与模拟器差异
    // 如需放大/缩小请用底部控制按钮，不在这里改变行列与尺寸
    const ww = window.innerWidth;
    if (ww < 480) {
      // 仅轻微放大，保留相同行列，确保视觉一致
      config.currentZoom = 0.8;
    } else if (ww < 768) {
      config.currentZoom = 0.7;
    }
    const gridState = gridStateRef.current;

    const gridItems = Array.from(gridContainer?.querySelectorAll<HTMLElement>('.grid-item') || []);

    const calculateGapForZoom = (zoomLevel: number) => {
      if (zoomLevel >= 1.0) return 16;
      if (zoomLevel >= 0.6) return 32;
      return 64;
    };

    const calculateGridDimensions = (gap = config.currentGap) => {
      const totalWidth = config.cols * (config.itemSize + gap) - gap;
      const totalHeight = config.rows * (config.itemSize + gap) - gap;
      gridState.width = totalWidth;
      gridState.height = totalHeight;
      gridState.scaledWidth = totalWidth * config.currentZoom;
      gridState.scaledHeight = totalHeight * config.currentZoom;
      gridState.gap = gap;
    };

    const layoutGridItems = () => {
      // lay items row-major，并同步每个单元的尺寸，避免与 CSS 固定尺寸不一致导致重叠
      let index = 0;
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          const el = gridItems[index];
          if (!el) return;
          const x = col * (config.itemSize + config.currentGap);
          const y = row * (config.itemSize + config.currentGap);
          // 同步尺寸（同时写入 CSS 变量与行内样式，兼容移动端）
          el.style.setProperty('--grid-item-size', `${config.itemSize}px`);
          el.style.width = `${config.itemSize}px`;
          el.style.height = `${config.itemSize}px`;
          // 使用 transform 放置以避免 Safari 真机 subpixel 布局偏差
          el.style.left = `0px`;
          el.style.top = `0px`;
          (el as HTMLElement).style.transform = `translate3d(${x}px, ${y}px, 0)`;
          (el as any)._baseX = x;
          (el as any)._baseY = y;
          index++;
        }
      }
    };

    // 参考原版 IntersectionObserver 实现可见性渐变（移动端禁用以提升性能）
    const setupVisibilityObserver = () => {
      // 移动端禁用可见性动画以提升性能
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return null;
      }
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const overlay = entry.target.querySelector('.visibility-overlay') as HTMLDivElement | null;
            if (!overlay) return;

            if (entry.isIntersecting) {
              // 进入视口：淡出黑色遮罩
              gsap.to(overlay, {
                opacity: 0,
                duration: 2.5,
                ease: 'power2.out'
              });
            } else {
              // 离开视口：淡入黑色遮罩
              gsap.to(overlay, {
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
              });
            }
          });
        },
        {
          root: null,
          threshold: 0.15,
          rootMargin: '10%'
        }
      );

      gridItems.forEach((el) => {
        observer.observe(el);
      });

      return observer;
    };

    const centerCanvas = () => {
      if (!canvasWrapper) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const centerX = (vw - gridState.scaledWidth) / 2;
      const centerY = (vh - gridState.scaledHeight) / 2;
      gsap.set(canvasWrapper, { x: centerX, y: centerY, scale: config.currentZoom });
      (draggableRef as any).currentPos = { x: centerX, y: centerY };
    };

    const calculateBounds = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = config.currentGap * config.currentZoom;
      // 允许额外拖动范围（软边界），按视口尺寸的 35% 或至少 120px（更柔和）
      const overscroll = Math.max(120, Math.min(vw, vh) * 0.35);
      let hardMinX: number, hardMaxX: number, hardMinY: number, hardMaxY: number;
      if (gridState.scaledWidth <= vw) {
        const cx = (vw - gridState.scaledWidth) / 2;
        hardMinX = hardMaxX = cx;
      } else {
        hardMaxX = margin;
        hardMinX = vw - gridState.scaledWidth - margin;
      }
      if (gridState.scaledHeight <= vh) {
        const cy = (vh - gridState.scaledHeight) / 2;
        hardMinY = hardMaxY = cy;
      } else {
        hardMaxY = margin;
        hardMinY = vh - gridState.scaledHeight - margin;
      }
      const softMinX = hardMinX - overscroll;
      const softMaxX = hardMaxX + overscroll;
      const softMinY = hardMinY - overscroll;
      const softMaxY = hardMaxY + overscroll;
      return { hard: { minX: hardMinX, maxX: hardMaxX, minY: hardMinY, maxY: hardMaxY }, soft: { minX: softMinX, maxX: softMaxX, minY: softMinY, maxY: softMaxY } };
    };

    const initDraggable = () => {
      if (!canvasWrapper) return;
      if (draggableRef.current) {
        draggableRef.current.kill();
        draggableRef.current = null;
      }
      const bounds = calculateBounds();
      draggableRef.current = Draggable.create(canvasWrapper, {
        type: 'x,y',
        bounds: bounds.soft,
        edgeResistance: 0.4,
        inertia: false,
        onDragStart: () => {
          // stop existing inertia
          if (inertiaTweenRef.current) {
            inertiaTweenRef.current.kill();
            inertiaTweenRef.current = null;
          }
          velocitySamplesRef.current = [{ x: draggableRef.current.x, y: draggableRef.current.y, t: performance.now() }];
          try { (window as any)._soundPlay && (window as any)._soundPlay('drag-start'); } catch {}
        },
        onDrag: () => {
          const now = performance.now();
          velocitySamplesRef.current.push({ x: draggableRef.current.x, y: draggableRef.current.y, t: now });
          if (velocitySamplesRef.current.length > 6) velocitySamplesRef.current.shift();
        },
        onDragEnd: () => {
          try { (window as any)._soundPlay && (window as any)._soundPlay('drag-end'); } catch {}
          const samples = velocitySamplesRef.current;
          if (samples.length < 2) return;
          const a = samples[0];
          const b = samples[samples.length - 1];
          let dt = b.t - a.t;
          if (dt <= 0) return;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          // px/ms velocity
          const vx = dx / dt;
          const vy = dy / dt;
          // momentum projection factor (ms)
          const projection = 800; // 更长的动量投射，配合更柔和回弹
          let targetX = draggableRef.current.x + vx * projection;
          let targetY = draggableRef.current.y + vy * projection;
          const { hard, soft } = calculateBounds();
          // 先限制在软边界内，允许一定超出
          targetX = Math.max(soft.minX, Math.min(soft.maxX, targetX));
          targetY = Math.max(soft.minY, Math.min(soft.maxY, targetY));
          if (inertiaTweenRef.current) inertiaTweenRef.current.kill();
          inertiaTweenRef.current = gsap.to(canvasWrapper, {
            x: targetX,
            y: targetY,
            duration: 1.0,
            ease: 'power2.out',
            onUpdate: () => {
              // keep Draggable's values in sync while tweening
              if (draggableRef.current) draggableRef.current.update();
            },
            onComplete: () => {
              // 若最终位置超出硬边界，则回弹到硬边界范围
              const finalX = (canvasWrapper as any)._gsap ? (canvasWrapper as any)._gsap.x : targetX;
              const finalY = (canvasWrapper as any)._gsap ? (canvasWrapper as any)._gsap.y : targetY;
              const clampX = Math.max(hard.minX, Math.min(hard.maxX, Number(finalX)));
              const clampY = Math.max(hard.minY, Math.min(hard.maxY, Number(finalY)));
              const needsBounce = Math.abs(clampX - Number(finalX)) > 0.5 || Math.abs(clampY - Number(finalY)) > 0.5;
              if (needsBounce) {
                gsap.to(canvasWrapper, {
                  x: clampX,
                  y: clampY,
                  duration: 1.1,
                  ease: 'elastic.out(0.8, 0.35)',
                  onUpdate: () => { if (draggableRef.current) draggableRef.current.update(); },
                  onComplete: () => { inertiaTweenRef.current = null; }
                });
              } else {
                inertiaTweenRef.current = null;
              }
            }
          });
        }
      })[0];
    };

    const playIntroAnimation = () => {
      if (!canvasWrapper || !viewport) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const style = getComputedStyle(canvasWrapper);
      const matrix = new DOMMatrix(style.transform);
      const canvasX = matrix.m41;
      const canvasY = matrix.m42;
      const canvasScale = matrix.a;
      const centerX = (vw / 2 - canvasX) / canvasScale - config.itemSize / 2;
      const centerY = (vh / 2 - canvasY) / canvasScale - config.itemSize / 2;

      gridItems.forEach((el, i) => {
        const z = gridItems.length - i;
        gsap.set(el, { left: centerX, top: centerY, scale: 0.8, zIndex: z, opacity: 0 });
      });

      gsap.to(gridItems, {
        duration: 0.6,
        left: (_i, el: any) => el._baseX,
        top: (_i, el: any) => el._baseY,
        scale: 1,
        opacity: 1,
        ease: 'sCurve',
        stagger: { amount: 2.0, from: 'start' },
        onComplete: () => {
          gridItems.forEach((el) => gsap.set(el, { zIndex: 1 }));
          if (controlsContainer) gsap.to(controlsContainer, { opacity: 1, duration: 0.5, ease: 'power2.out' });
        }
      });
    };

    const setOverlayText = (index: number) => {
      const nEl = document.querySelector('#imageSlideNumber span');
      const tEl = document.querySelector('#imageSlideTitle h1');
      const dEl = document.getElementById('imageSlideDescription');
      if (!nEl || !tEl || !dEl) return;
      const num = String((index % 99) + 1).padStart(2, '0');
      nEl.textContent = num;
      const item = portfolioItems[index % portfolioItems.length];
      tEl.textContent = item?.title || '作品';
      dEl.innerHTML = '';
      const content = (item?.content || '').trim();
      const lines = content.split(/(?<=[。！？.!?])\s+/).filter(Boolean);
      lines.forEach((line) => {
        const span = document.createElement('span');
        span.className = 'description-line';
        span.textContent = line;
        dEl.appendChild(span);
      });
    };

    const createScalingOverlay = (img: HTMLImageElement) => {
      const overlay = document.createElement('div');
      overlay.className = 'scaling-image-overlay';
      const clone = document.createElement('img');
      clone.src = img.src;
      clone.alt = img.alt;
      overlay.appendChild(clone);
      document.body.appendChild(overlay);
      const rect = img.getBoundingClientRect();
      gsap.set(overlay, { left: rect.left, top: rect.top, width: rect.width, height: rect.height, opacity: 1 });
      return overlay;
    };

    // 使用更平滑的 S 型曲线（接近 easeInOutSine）
    const customEase = CustomEase.create('sCurve', '.45,0,.55,1');

    const enterZoom = (el: HTMLElement, index: number) => {
      if (!splitScreenContainer) return;
      if (zoomStateRef.current.isActive) return;
      const img = el.querySelector('img') as HTMLImageElement | null;
      if (!img) return;
      // sound: open
      try { (window as any)._soundPlay && (window as any)._soundPlay('open'); } catch {}
      zoomStateRef.current.isActive = true;
      zoomStateRef.current.selectedEl = el;
      zoomStateRef.current.selectedImg = img;

      const overlay = createScalingOverlay(img);
      zoomStateRef.current.overlay = overlay;
      gsap.set(img, { opacity: 0 });

      const zoomTarget = document.getElementById('zoomTarget');
      setOverlayText(index);
      splitScreenContainer.classList.add('active');
      if (controlsContainer) {
        (controlsContainer as HTMLElement).classList.add('split-mode');
      }
      // 展开时显示左右导航按钮
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      if (prevBtn && nextBtn) {
        gsap.set([prevBtn, nextBtn], { display: 'inline-flex' });
        gsap.to([prevBtn, nextBtn], { opacity: 1, duration: 0.4, ease: customEase });
      }

      // 先把被点击的图片平移到视口中心，再进行放大动画
      const centerAndZoom = () => {
        if (!canvasWrapper) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const style = getComputedStyle(canvasWrapper);
        const matrix = new DOMMatrix(style.transform);
        const currentScale = matrix.a;
        const baseX = (el as any)._baseX || 0;
        const baseY = (el as any)._baseY || 0;
        const desiredX = vw / 2 - currentScale * (baseX + config.itemSize / 2);
        const desiredY = vh / 2 - currentScale * (baseY + config.itemSize / 2);
        const { soft } = calculateBounds();
        const targetX = Math.max(soft.minX, Math.min(soft.maxX, desiredX));
        const targetY = Math.max(soft.minY, Math.min(soft.maxY, desiredY));
        const currentX = (canvasWrapper as any)._gsap ? Number((canvasWrapper as any)._gsap.x) : targetX;
        const currentY = (canvasWrapper as any)._gsap ? Number((canvasWrapper as any)._gsap.y) : targetY;
        const needsMove = Math.abs(currentX - targetX) + Math.abs(currentY - targetY) > 2;
        const doFlip = (): void => {
          gsap.to(splitScreenContainer, { opacity: 1, duration: 0.8, ease: customEase });
          zoomStateRef.current.flip = (Flip.fit(overlay, zoomTarget!, {
            duration: 0.9,
            ease: customEase,
            absolute: true,
            onComplete: () => {
              const overlayEl = imageTitleOverlay as HTMLElement | null;
              if (overlayEl) gsap.to(overlayEl, { opacity: 1, duration: 0.3, ease: 'power2.out' });
              // 安装移动端双指缩放监听（仅在展开后）
              const overlayImg = overlay.querySelector('img') as HTMLImageElement | null;
              if (overlayImg) {
                const getDist = (t1: Touch, t2: Touch) => {
                  const dx = t1.clientX - t2.clientX;
                  const dy = t1.clientY - t2.clientY;
                  return Math.hypot(dx, dy);
                };
                const onTouchStart = (e: TouchEvent) => {
                  if (e.touches.length === 2) {
                    const d = getDist(e.touches[0], e.touches[1]);
                    pinchRef.current = { startDist: d, startScale: 1, currentScale: 1 };
                    try { e.preventDefault(); } catch {}
                  }
                };
                const onTouchMove = (e: TouchEvent) => {
                  if (pinchRef.current && e.touches.length === 2) {
                    const d = getDist(e.touches[0], e.touches[1]);
                    const ratio = d / Math.max(1, pinchRef.current.startDist);
                    const target = Math.min(2.5, Math.max(1, pinchRef.current.startScale * ratio));
                    pinchRef.current.currentScale = target;
                    overlayImg.style.transform = `translateZ(0) scale(${target})`;
                    try { e.preventDefault(); } catch {}
                  }
                };
                const onTouchEnd = (_e: TouchEvent) => {
                  if (pinchRef.current) {
                    // 结束时记住最终缩放作为新起点
                    pinchRef.current.startScale = pinchRef.current.currentScale;
                  }
                };
                overlayImg.addEventListener('touchstart', onTouchStart, { passive: false });
                overlayImg.addEventListener('touchmove', onTouchMove, { passive: false });
                overlayImg.addEventListener('touchend', onTouchEnd, { passive: false });
                // 保存到 overlay 节点以便清理
                (overlayImg as any)._pinchHandlers = { onTouchStart, onTouchMove, onTouchEnd };
              }
            }
          }) as unknown as gsap.core.Tween);
        };
        if (needsMove) {
          gsap.to(canvasWrapper, { x: targetX, y: targetY, duration: 0.6, ease: customEase, onComplete: () => { doFlip(); } });
        } else {
          doFlip();
        }
      };
      centerAndZoom();
      if (closeButton) closeButton.classList.add('active');
    };

    const exitZoom = () => {
      if (!zoomStateRef.current.isActive) return;
      try { (window as any)._soundPlay && (window as any)._soundPlay('close'); } catch {}
      const split = splitScreenContainer!;
      const { overlay, selectedEl, selectedImg, flip } = zoomStateRef.current;
      if (flip) flip.kill();
      gsap.to('#imageTitleOverlay', { opacity: 0, duration: 0.3, ease: 'power2.out' });
      if (controlsContainer) {
        (controlsContainer as HTMLElement).classList.remove('split-mode');
      }
      // 隐藏左右导航按钮
      const prevBtnHide = document.getElementById('prevBtn');
      const nextBtnHide = document.getElementById('nextBtn');
      if (prevBtnHide && nextBtnHide) {
        gsap.to([prevBtnHide, nextBtnHide], { opacity: 0, duration: 0.3, ease: 'power2.out', onComplete: () => { gsap.set([prevBtnHide, nextBtnHide], { display: 'none' }); } });
      }
      gsap.to(split, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => split.classList.remove('active') });
      if (overlay && selectedEl) {
        Flip.fit(overlay, selectedEl, {
          duration: 0.8,
          ease: customEase,
          absolute: true,
          onComplete: () => {
            if (selectedImg) gsap.set(selectedImg, { opacity: 1 });
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            zoomStateRef.current.overlay = null;
            zoomStateRef.current.selectedEl = null;
            zoomStateRef.current.selectedImg = null;
            zoomStateRef.current.flip = null;
            zoomStateRef.current.isActive = false;
            zoomStateRef.current.currentIndex = 0;
            // 移除移动端缩放监听
            try {
              const overlayImg = overlay.querySelector('img') as HTMLImageElement | null;
              const handlers = overlayImg && (overlayImg as any)._pinchHandlers;
              if (overlayImg && handlers) {
                overlayImg.removeEventListener('touchstart', handlers.onTouchStart);
                overlayImg.removeEventListener('touchmove', handlers.onTouchMove);
                overlayImg.removeEventListener('touchend', handlers.onTouchEnd);
                delete (overlayImg as any)._pinchHandlers;
              }
            } catch {}
          }
        });
      }
      if (closeButton) closeButton.classList.remove('active');
    };

    const setZoom = (zoom: number) => {
      if (!canvasWrapper) return;
      if (zoomStateRef.current.isActive) {
        exitZoom();
        return;
      }
      // sound: zoom in/out
      try { (window as any)._soundPlay && (window as any)._soundPlay(zoom < config.currentZoom ? 'zoom-out' : 'zoom-in'); } catch {}
      const oldGap = config.currentGap;
      config.currentZoom = zoom;
      const newGap = calculateGapForZoom(zoom);
      calculateGridDimensions(oldGap);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const currentScaledWidth = gridState.width * config.currentZoom;
      const currentScaledHeight = gridState.height * config.currentZoom;
      const centerX = (vw - currentScaledWidth) / 2;
      const centerY = (vh - currentScaledHeight) / 2;

      // update positions if gap changed
      if (newGap !== config.currentGap) {
        const targetGap = newGap;
        gridItems.forEach((el: any) => {
          const col = Math.round(el._baseX / (config.itemSize + config.currentGap));
          const row = Math.round(el._baseY / (config.itemSize + config.currentGap));
          const newX = col * (config.itemSize + targetGap);
          const newY = row * (config.itemSize + targetGap);
          el._baseX = newX;
          el._baseY = newY;
          gsap.to(el, { duration: 1.0, x: newX, y: newY, ease: customEase });
        });
        const newWidth = config.cols * (config.itemSize + targetGap) - targetGap;
        const newHeight = config.rows * (config.itemSize + targetGap) - targetGap;
        gsap.to(canvasWrapper, { duration: 1.0, width: newWidth, height: newHeight, ease: customEase });
        config.currentGap = targetGap;
      }

      calculateGridDimensions(config.currentGap);
      const finalScaledWidth = gridState.width * zoom;
      const finalScaledHeight = gridState.height * zoom;
      const finalCenterX = (vw - finalScaledWidth) / 2;
      const finalCenterY = (vh - finalScaledHeight) / 2;

      gsap.to(canvasWrapper, {
        duration: 1.0,
        scale: zoom,
        x: finalCenterX,
        y: finalCenterY,
        ease: customEase,
        onComplete: () => initDraggable()
      });
    };

    // wire up clicks
    gridItems.forEach((el, i) => {
      el.addEventListener('click', () => {
        try { (window as any)._soundPlay && (window as any)._soundPlay('click'); } catch {}
        if (!zoomStateRef.current.isActive) enterZoom(el, i);
      });
    });
    const splitLeft = document.getElementById('splitLeft');
    const splitRight = document.getElementById('splitRight');
    const splitClick = (e: Event) => { if (e.target === e.currentTarget) exitZoom(); };
    splitLeft?.addEventListener('click', splitClick);
    splitRight?.addEventListener('click', splitClick);
    closeButton?.addEventListener('click', exitZoom);

    // controls
    const switchButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.switch-button'));
    switchButtons[0]?.addEventListener('click', () => setZoom(0.3));
    switchButtons[1]?.addEventListener('click', () => setZoom(0.6));
    switchButtons[2]?.addEventListener('click', () => setZoom(1.0));
    switchButtons[3]?.addEventListener('click', () => {
      // auto fit
      const vw = window.innerWidth;
      const vh = window.innerHeight - 80;
      const gapForFit = calculateGapForZoom(1.0);
      const gridW = config.cols * (config.itemSize + gapForFit) - gapForFit;
      const gridH = config.rows * (config.itemSize + gapForFit) - gapForFit;
      const margin = 40;
      const availW = vw - margin * 2;
      const availH = vh - margin * 2;
      const fitZoom = Math.max(0.1, Math.min(2.0, Math.min(availW / gridW, availH / gridH)));
      setZoom(fitZoom);
    });

    // 左右切换
    const changePhoto = (direction: 1 | -1) => {
      if (!zoomStateRef.current.isActive) return;
      const total = portfolioItems.length;
      let nextIndex = (zoomStateRef.current.currentIndex + direction + total) % total;
      zoomStateRef.current.currentIndex = nextIndex;
      setOverlayText(nextIndex);
      const overlayEl = zoomStateRef.current.overlay;
      if (overlayEl) {
        const overlayImg = overlayEl.querySelector('img') as HTMLImageElement | null;
        const nextItem = portfolioItems[nextIndex];
        if (overlayImg && nextItem) {
          gsap.to(overlayImg, { opacity: 0, duration: 0.25, ease: customEase, onComplete: () => {
            overlayImg.src = nextItem.image || overlayImg.src;
            gsap.to(overlayImg, { opacity: 1, duration: 0.25, ease: customEase });
          }});
        }
      }
    };
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const onPrev = () => changePhoto(-1);
    const onNext = () => changePhoto(1);
    prevBtn?.addEventListener('click', onPrev);
    nextBtn?.addEventListener('click', onNext);

    // init layout and animate
    config.currentGap = calculateGapForZoom(config.currentZoom);
    calculateGridDimensions(config.currentGap);
    if (canvasWrapper) {
      gsap.set(canvasWrapper, { width: gridState.width, height: gridState.height, scale: config.currentZoom });
    }
    layoutGridItems();
    calculateGridDimensions(config.currentGap);
    centerCanvas();
    gsap.set(viewport, { opacity: 0 });
    const introPlayed = typeof window !== 'undefined' && sessionStorage.getItem('galleryIntroPlayed') === 'true';
    if (introPlayed) {
      // 跳过再次铺排动画
      gsap.to(viewport, { duration: 0.3, opacity: 1, ease: 'sCurve' });
      if (controlsContainer) gsap.to(controlsContainer, { opacity: 1, duration: 0.3, ease: 'sCurve' });
    } else {
      gsap.to(viewport, { duration: 0.6, opacity: 1, ease: 'sCurve', onComplete: () => {
        playIntroAnimation();
        try { sessionStorage.setItem('galleryIntroPlayed', 'true'); } catch {}
      }});
    }
    initDraggable();
    
    // 移动端双指缩放功能（仅针对网格，非放大状态）
    let gridPinchState: { startDist: number; startZoom: number } | null = null;
    const setupGridPinch = () => {
      if (!viewport) return;
      
      const getDist = (t1: Touch, t2: Touch) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.hypot(dx, dy);
      };
      
      const onTouchStart = (e: TouchEvent) => {
        // 只在未放大状态且双指触摸时启用
        if (e.touches.length === 2 && !zoomStateRef.current.isActive) {
          const d = getDist(e.touches[0], e.touches[1]);
          gridPinchState = { startDist: d, startZoom: config.currentZoom };
          e.preventDefault();
        }
      };
      
      const onTouchMove = (e: TouchEvent) => {
        if (gridPinchState && e.touches.length === 2 && !zoomStateRef.current.isActive) {
          const d = getDist(e.touches[0], e.touches[1]);
          const ratio = d / Math.max(1, gridPinchState.startDist);
          const targetZoom = Math.min(2.0, Math.max(0.3, gridPinchState.startZoom * ratio));
          
          // 实时应用缩放
          if (canvasWrapper) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const scaledWidth = gridState.width * targetZoom;
            const scaledHeight = gridState.height * targetZoom;
            const centerX = (vw - scaledWidth) / 2;
            const centerY = (vh - scaledHeight) / 2;
            
            gsap.set(canvasWrapper, {
              scale: targetZoom,
              x: centerX,
              y: centerY
            });
            config.currentZoom = targetZoom;
          }
          
          e.preventDefault();
        }
      };
      
      const onTouchEnd = (_e: TouchEvent) => {
        if (gridPinchState && !zoomStateRef.current.isActive) {
          // 更新缩放级别并重新初始化拖拽
          const newGap = calculateGapForZoom(config.currentZoom);
          if (newGap !== config.currentGap) {
            config.currentGap = newGap;
            calculateGridDimensions(config.currentGap);
          }
          initDraggable();
          gridPinchState = null;
        }
      };
      
      viewport.addEventListener('touchstart', onTouchStart, { passive: false });
      viewport.addEventListener('touchmove', onTouchMove, { passive: false });
      viewport.addEventListener('touchend', onTouchEnd, { passive: false });
      
      return { onTouchStart, onTouchMove, onTouchEnd };
    };
    
    const gridPinchHandlers = setupGridPinch();
    
    // 初始化可见性渐变观察器
    const visibilityObserver = setupVisibilityObserver();

    const onResize = () => {
      // 保持与PC一致的网格行列与单元尺寸，仅调整 zoom 以适配小屏
      const ww = window.innerWidth;
      if (ww < 480) {
        config.currentZoom = 0.8;
      } else if (ww < 768) {
        config.currentZoom = 0.7;
      } else {
        config.currentZoom = 0.6;
      }

      calculateGridDimensions(config.currentGap);
      if (canvasWrapper) {
        gsap.set(canvasWrapper, { width: gridState.width, height: gridState.height, scale: config.currentZoom });
      }
      layoutGridItems();
      centerCanvas();
      initDraggable();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      gridItems.forEach((el) => el.replaceWith(el.cloneNode(true)));
      if (draggableRef.current) {
        draggableRef.current.kill();
        draggableRef.current = null;
      }
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      if (visibilityObserver) {
        try {
          visibilityObserver.disconnect();
        } catch (e) {
          // 可能为null，忽略错误
        }
      }
      // 清理双指缩放监听器
      if (gridPinchHandlers && viewport) {
        viewport.removeEventListener('touchstart', gridPinchHandlers.onTouchStart);
        viewport.removeEventListener('touchmove', gridPinchHandlers.onTouchMove);
        viewport.removeEventListener('touchend', gridPinchHandlers.onTouchEnd);
      }
    };
  }, [portfolioItems, preloaderDone]);

  // Sound system + sound wave canvas
  useEffect(() => {
    const sound = {
      enabled: false,
      sounds: {
        click: new Audio('https://assets.codepen.io/7558/glitch-fx-001.mp3'),
        open: new Audio('https://assets.codepen.io/7558/click-glitch-001.mp3'),
        close: new Audio('https://assets.codepen.io/7558/click-glitch-001.mp3'),
        'zoom-in': new Audio('https://assets.codepen.io/7558/whoosh-fx-001.mp3'),
        'zoom-out': new Audio('https://assets.codepen.io/7558/whoosh-fx-001.mp3'),
        'drag-start': new Audio('https://assets.codepen.io/7558/preloader-2s-001.mp3'),
        'drag-end': new Audio('https://assets.codepen.io/7558/preloader-2s-001.mp3')
      },
      play: (name: keyof any) => {
        if (!sound.enabled) return;
        const a = (sound.sounds as any)[name] as HTMLAudioElement | undefined;
        if (!a) return;
        try { a.currentTime = 0; a.play().catch(() => {}); } catch {}
      },
      toggle: () => {
        sound.enabled = !sound.enabled;
        const btn = document.getElementById('soundToggle');
        if (btn) btn.classList.toggle('active', sound.enabled);
      }
    };
    Object.values(sound.sounds).forEach((a) => { a.preload = 'auto'; a.volume = 0.3; });
    (window as any)._soundPlay = sound.play;

    const canvas = document.getElementById('soundWaveCanvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const centerY = Math.floor(height / 2);
    let startTime = Date.now();
    let currentAmp = 0;
    let raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const animate = () => {
      const targetAmp = sound.enabled ? 1 : 0;
      currentAmp = lerp(currentAmp, targetAmp, 0.08);
      ctx.clearRect(0, 0, width, height);
      const time = (Date.now() - startTime) / 1000;
      const muteFactor = 1 - currentAmp;
      const primaryColor = '#2C1B14';
      const accentColor = '#A64B23';
      const muteColor = '#D9C4AA';
      if (!sound.enabled && currentAmp < 0.01) {
        ctx.fillStyle = muteColor;
        ctx.fillRect(0, centerY, width, 2);
      } else {
        ctx.fillStyle = primaryColor;
        for (let i = 0; i < width; i++) {
          const x = i - width / 2;
          const e = Math.exp((-x * x) / 50);
          const y = centerY + Math.cos(x * 0.4 - time * 8) * e * height * 0.35 * currentAmp;
          ctx.fillRect(i, Math.round(y), 1, 2);
        }
        ctx.fillStyle = accentColor;
        for (let i = 0; i < width; i++) {
          const x = i - width / 2;
          const e = Math.exp((-x * x) / 80);
          const y = centerY + Math.cos(x * 0.3 - time * 5) * e * height * 0.25 * currentAmp;
          ctx.fillRect(i, Math.round(y), 1, 2);
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const toggleBtn = document.getElementById('soundToggle');
    const onClick = () => sound.toggle();
    toggleBtn?.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      toggleBtn?.removeEventListener('click', onClick);
      delete (window as any)._soundPlay;
    };
  }, []);

  // 静态主结构还原 index.html。数据与后续动画分离。
  return (
    <div className="gallery-area font-sans relative" style={{minHeight: '90vh', width: '100%'}}>
      {/* Viewport主区域和动态网格容器 */}
      <div className="relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="viewport" id="viewport">
          <div className="canvas-wrapper" id="canvasWrapper">
            <div className="grid-container" id="gridContainer">
              {/* 动态注入作品项 */}
              {portfolioItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid-item"
                  data-id={item.id}
                  tabIndex={0}
                  style={{zIndex: 1}}
                >
                  <img src={item.image} alt={item.title} draggable={false} />
                  <div className="visibility-overlay"></div>
                  {/* 隐藏: 可选title/desc渲染(可后续动态弹出) */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 分屏容器/右侧详情 */}
      <div className="split-screen-container" id="splitScreenContainer">
        <div className="split-left" id="splitLeft">
          <div className="zoom-target" id="zoomTarget"></div>
        </div>
        <div className="split-right" id="splitRight">
          <div className="image-title-overlay" id="imageTitleOverlay">
            <div className="image-slide-number" id="imageSlideNumber">
              <span>01</span>
            </div>
            <div className="image-slide-title" id="imageSlideTitle">
              <h1>作品标题</h1>
            </div>
            <div className="image-slide-description" id="imageSlideDescription"></div>
          </div>
        </div>
      </div>
      {/* 关闭放大按钮 */}
      <button className="close-button" id="closeButton">
        <svg width="64" height="64" viewBox="0 0 16 16" fill="none"><path d="M7.89873 16L6.35949 14.48L11.8278 9.08H0V6.92H11.8278L6.35949 1.52L7.89873 0L16 8L7.89873 16Z" fill="white"/></svg>
      </button>
      {/* 控制区/缩放/音效 */}
      <div className="controls-container" id="controlsContainer">
        {/* 百分比显示已移除 */}
        <div className="switch" id="controls">
          <button className="switch-button"><span className="indicator-dot"></span>ZOOM OUT</button>
          <button className="switch-button switch-button-current"><span className="indicator-dot"></span>NORMAL</button>
          <button className="switch-button"><span className="indicator-dot"></span>ZOOM IN</button>
          <button className="switch-button"><span className="indicator-dot"></span>FIT</button>
        </div>
        <button className="sound-toggle" id="soundToggle">
          <canvas className="sound-wave-canvas" id="soundWaveCanvas" width={32} height={16}></canvas>
        </button>
      </div>
      {/* 底部footer栏 */}
      <div className="footer">
        <div className="info-section">
          <p>Est. 2025 • Summer Days</p>
          <p>34.0522° N, 118.2437° W</p>
        </div>
      </div>
      
    </div>
  );
}
