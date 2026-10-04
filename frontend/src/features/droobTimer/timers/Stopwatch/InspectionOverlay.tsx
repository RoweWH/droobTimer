import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useVoice } from '../../../../context/VoiceContext';
import type { TimerSettings } from '../../types';

import './InspectionOverlay.css';

type InspectionOverlayProps = {
  inspection: TimerSettings['inspection'];
  inspectionTime: number;
};

export function InspectionOverlay({ inspection, inspectionTime }: InspectionOverlayProps) {
  const { playVoice } = useVoice();

  const elapsedSeconds = Math.floor(inspectionTime);

  useEffect(() => {
    if (elapsedSeconds === 15) {
      playVoice('plusTwo');
    }

    if (elapsedSeconds === 17) {
      playVoice('dnf');
    }

    if (inspection === 'droob') {
      if (elapsedSeconds === 6) {
        playVoice('six');
      }

      if (elapsedSeconds === 7) {
        playVoice('seven');
      }
    }

    if (inspection === 'wca') {
      if (elapsedSeconds === 8) {
        playVoice('eight');
      }

      if (elapsedSeconds === 12) {
        playVoice('twelve');
      }
    }
  }, [elapsedSeconds, inspection, playVoice]);

  let display = elapsedSeconds.toString();
  let textColor = 'normal';

  if (inspectionTime >= 17) {
    display = 'DNF';
  } else if (inspectionTime >= 15) {
    display = '+2';
  }

  if (inspection === 'droob') {
    if (inspectionTime >= 7) {
      textColor = 'red';
    } else if (inspectionTime >= 6) {
      textColor = 'orange';
    }
  }

  if (inspection === 'wca') {
    if (inspectionTime >= 12) {
      textColor = 'red';
    } else if (inspectionTime >= 8) {
      textColor = 'orange';
    }
  }

  return createPortal(
    <div className="inspection-overlay">
      <div className="inspection-overlay__time" data-color={textColor}>
        {display}
      </div>
    </div>,
    document.body
  );
}
