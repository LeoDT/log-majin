import { ScreenId, useScreenShownEffect } from '../atoms/ui';

export const id: ScreenId = 'log';
export const name = 'logTab';

export function Screen(): JSX.Element {
  useScreenShownEffect(
    id,
    () => {
      console.log(111);
    },
    [],
  );

  return <div>1</div>;
}

Screen.displayName = 'LogScreen';
