import { useState } from 'react';

import { SketchInput } from '../../../../../components/Sketch';
import { useSpacebar } from '../useSpacebar';
import { parseTime } from '../../../utils/parseTime';

type ManualProps = {
  inspectionEnabled: boolean;
  isInspecting: boolean;
  onStartInspection: () => void;
  onEndInspection: () => void;
  onSubmit: (time: number) => void;
};

export function Manual({
  inspectionEnabled,
  isInspecting,
  onStartInspection,
  onEndInspection,
  onSubmit,
}: ManualProps) {
  const [value, setValue] = useState('');

  useSpacebar({
    onPress: () => {},
    onRelease: () => {
      if (!inspectionEnabled) {
        return;
      }

      if (isInspecting) {
        onEndInspection();
      } else {
        onStartInspection();
      }
    },
  });

  function submit() {
    const time = parseTime(value);

    if (time === null) {
      return;
    }

    onSubmit(time);
    setValue('');
  }

  return (
    <SketchInput
      value={value}
      placeholder="enter time"
      onChange={event => setValue(event.target.value)}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          submit();
        }
      }}
    />
  );
}
