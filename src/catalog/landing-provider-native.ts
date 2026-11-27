export function landingProviderNativeSource(args: {
  animationsDisabled?: boolean;
  defaultAnimationsDisabled?: boolean;
}) {
  return `import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AccessibilityInfo, StyleSheet, Switch, Text, View } from 'react-native';

const MotionContext = createContext({
  disabled: false,
  setDisabled: (_disabled: boolean) => {},
});

export function useLandingMotion() {
  return useContext(MotionContext);
}

export function LandingProvider({
  children,
  animationsDisabled,
  defaultAnimationsDisabled,
  onAnimationsDisabledChange,
}: {
  children: ReactNode;
  animationsDisabled?: boolean;
  defaultAnimationsDisabled?: boolean;
  onAnimationsDisabledChange?: (disabled: boolean) => void;
}) {
  const parent = useContext(MotionContext);
  const [systemReduced, setSystemReduced] = useState(false);
  const [local, setLocal] = useState(defaultAnimationsDisabled);

  useEffect(() => {
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      changed = true;
      setSystemReduced(value);
    });
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active && !changed) setSystemReduced(value);
    }).catch(() => {});
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  function setDisabled(disabled: boolean) {
    if (animationsDisabled === undefined) setLocal(disabled);
    onAnimationsDisabledChange?.(disabled);
  }

  return (
    <MotionContext.Provider value={{
      disabled: systemReduced || (animationsDisabled ?? local ?? parent.disabled),
      setDisabled,
    }}>
      <View style={styles.surface}>{children}</View>
    </MotionContext.Provider>
  );
}

function MotionSetting() {
  const { disabled, setDisabled } = useLandingMotion();
  return (
    <View style={styles.setting}>
      <Text style={styles.label}>Ogranicz animacje</Text>
      <Switch accessibilityLabel="Ogranicz animacje" value={disabled} onValueChange={setDisabled} />
    </View>
  );
}

export default function Example() {
  return (
    <LandingProvider defaultAnimationsDisabled={${Boolean(args.animationsDisabled ?? args.defaultAnimationsDisabled)}}>
      <MotionSetting />
    </LandingProvider>
  );
}

const styles = StyleSheet.create({
  surface: { backgroundColor: '#ffffff' },
  setting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: 16 },
  label: { fontSize: 16, color: '#1b1b1b', flexShrink: 1 },
});
`;
}
