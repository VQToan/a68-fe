import { memo, useEffect, useRef, useState } from 'react';
import { Box, Tabs, Tab, IconButton, type SxProps, type Theme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { areEqual } from '@/utils/common';

export interface FilterTabItem {
  value: string;
  label: string;
}

interface FilterTabsProps {
  value: string;
  items: FilterTabItem[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
  showNavButtons?: boolean;
  scrollAmount?: number;
}

const FilterTabs = ({ value, items, onChange, ariaLabel, sx, showNavButtons = true, scrollAmount = 140 }: FilterTabsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const getScroller = () => {
    return containerRef.current?.querySelector('.MuiTabs-scroller') as HTMLElement | null;
  };

  const updateScrollState = () => {
    const scroller = getScroller();
    if (!scroller) return;
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const left = scroller.scrollLeft;
    setShowButtons(scroller.scrollWidth > scroller.clientWidth + 1);
    setCanLeft(left > 0);
    setCanRight(left < max - 1);
  };

  const scrollBy = (delta: number) => {
    const scroller = getScroller();
    if (!scroller) return;
    scroller.scrollBy({ left: delta, behavior: 'smooth' });
  };

  useEffect(() => {
    updateScrollState();
    const scroller = getScroller();
    if (!scroller) return;
    const onScroll = () => updateScrollState();
    scroller.addEventListener('scroll', onScroll, { passive: true } as any);
    const RO = (window as any).ResizeObserver;
    let ro: ResizeObserver | undefined;
    if (RO) {
      ro = new RO(() => updateScrollState());
      ro?.observe(scroller);
    } else {
      window.addEventListener('resize', onScroll);
    }
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, value]);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'relative', ...sx }} ref={containerRef}>
      {showNavButtons && showButtons && (
        <>
          <IconButton
            size="small"
            onClick={() => scrollBy(-scrollAmount)}
            disabled={!canLeft}
            sx={{
              position: 'absolute',
              left: -6,
              top: '50%',
              transform: 'translateY(-50%)',
              display: { xs: 'flex', md: 'none' },
              zIndex: 3,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => scrollBy(scrollAmount)}
            disabled={!canRight}
            sx={{
              position: 'absolute',
              right: -6,
              top: '50%',
              transform: 'translateY(-50%)',
              display: { xs: 'flex', md: 'none' },
              zIndex: 3,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      <Tabs
        value={value}
        onChange={(_e, v) => onChange(v)}
        aria-label={ariaLabel || 'filter tabs'}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile={false}
        sx={{ mb: 2, maxWidth: '100%' }}
      >
        {items.map((item) => (
          <Tab key={item.value} label={item.label} value={item.value} />
        ))}
      </Tabs>
    </Box>
  );
};

export default memo(FilterTabs, areEqual);
