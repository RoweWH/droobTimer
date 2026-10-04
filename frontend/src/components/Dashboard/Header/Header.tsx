import { useEffect, useRef, useState } from 'react';

import { useTheme } from '../../../context/ThemeContext';

import { TAGLINES } from './taglines';

import './Header.css';

const TAGLINE_SPEED = 50;

type HeaderProps = {
  onOpenSettings: () => void;
};

export function Header({ onOpenSettings }: HeaderProps) {
  const { theme } = useTheme();

  const taglineWindowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const taglineWindow = taglineWindowRef.current;
    const tagline = taglineRef.current;

    if (!taglineWindow || !tagline) {
      return;
    }

    const startPosition = taglineWindow.offsetWidth;
    const endPosition = -tagline.offsetWidth;
    const distance = startPosition - endPosition;
    const duration = (distance / TAGLINE_SPEED) * 1000;

    const animation = tagline.animate(
      [
        { transform: `translateX(${startPosition}px)` },
        { transform: `translateX(${endPosition}px)` },
      ],
      {
        duration,
        easing: 'linear',
        fill: 'both',
      }
    );

    tagline.style.visibility = 'visible';

    animation.onfinish = () => {
      tagline.style.visibility = 'hidden';

      setTaglineIndex(currentIndex => {
        return (currentIndex + 1) % TAGLINES.length;
      });
    };

    return () => {
      tagline.style.visibility = 'hidden';
      animation.cancel();
    };
  }, [taglineIndex]);

  return (
    <header className="header">
      <div className="header-logo-area">
        <img className="header-logo" src={theme.assets.logo} alt="DroobTimer" draggable={false} />

        <div ref={taglineWindowRef} className="header-tagline-window">
          <p ref={taglineRef} className="header-tagline">
            {TAGLINES[taglineIndex]}
          </p>
        </div>
      </div>

      <button
        className="header-settings-button"
        type="button"
        onClick={onOpenSettings}
        aria-label="Open settings"
      >
        <img
          className="header-settings-icon"
          src={theme.assets.icons.gear}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </button>
    </header>
  );
}
