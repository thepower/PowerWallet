import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

interface UseSmoothHorizontalScroll {
  scrollContainerRef: RefObject<HTMLDivElement>;
  handleScroll: () => void;
  scrollTo: (shift: number) => void;
  scrollToElementByIndex: (index: number) => void;
  scrollToNext: () => void;
  scrollToPrevious: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}

/**
 * Custom hook for smooth horizontal scrolling.
 * @returns An object containing:
 * - scrollContainerRef: A ref to the scroll container.
 * - handleScroll: A function to handle scroll events and update state.
 * - scrollTo: A function to scroll the container by a given amount.
 * - scrollToElementByIndex: A function to scroll the container to a specific element by index.
 * - scrollToNext: A function to scroll the container to the next element.
 * - scrollToPrevious: A function to scroll the container to the previous element.
 * - isAtStart: A boolean indicating if the container is at the start.
 * - isAtEnd: A boolean indicating if the container is at the end.
 */
export const useSmoothHorizontalScroll = (): UseSmoothHorizontalScroll => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAtStart, setIsAtStart] = useState<boolean>(true);
  const [isAtEnd, setIsAtEnd] = useState<boolean>(false);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    setIsAtEnd(
      scrollContainerRef.current.scrollWidth === scrollContainerRef.current.offsetWidth,
    );
  }, [scrollContainerRef]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    setIsAtStart(scrollContainerRef.current.scrollLeft === 0);
    setIsAtEnd(
      Math.floor(
        scrollContainerRef.current.scrollWidth - scrollContainerRef.current.scrollLeft,
      ) <= scrollContainerRef.current.offsetWidth,
    );
  };

  const scrollTo = (shift: number) => {
    scrollContainerRef.current?.scrollTo({
      left: scrollContainerRef.current.scrollLeft + shift,
      behavior: 'smooth',
    });
  };

  const scrollToElementByIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      const children = container.children;
      if (index >= 0 && index < children.length) {
        const element = children[index] as HTMLElement;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const containerCenter = containerRect.width / 2;
        const elementCenter = elementRect.left - containerRect.left + elementRect.width / 2;
        const scrollToPosition = elementCenter - containerCenter + container.scrollLeft;
        container.scrollTo({
          left: scrollToPosition,
          behavior: 'smooth',
        });
        setCurrentIndex(index);
      }
    }
  };

  const scrollToNext = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const children = container.children;
      const nextIndex = (currentIndex + 1) % children.length;
      scrollToElementByIndex(nextIndex);
    }
  };

  const scrollToPrevious = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const children = container.children;
      const previousIndex = (currentIndex - 1 + children.length) % children.length;
      scrollToElementByIndex(previousIndex);
    }
  };

  return {
    scrollContainerRef,
    handleScroll,
    scrollTo,
    scrollToElementByIndex,
    scrollToNext,
    scrollToPrevious,
    isAtStart,
    isAtEnd,
  };
};
