import { render, screen, fireEvent } from '@testing-library/react-native';

import { CompassButton } from './CompassButton';

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
    },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withTiming: (value: number) => value,
    Easing: {
      out: () => undefined,
      cubic: undefined,
    },
  };
});

describe('CompassButton', () => {
  it('renders in inactive state by default', () => {
    render(<CompassButton isHeadingMode={false} heading={null} onToggle={jest.fn()} />);

    const button = screen.getByTestId('compass-button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Orientation carte selon le cap');
  });

  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    render(<CompassButton isHeadingMode={false} heading={null} onToggle={onToggle} />);

    fireEvent.press(screen.getByTestId('compass-button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows active style when heading mode is on', () => {
    render(<CompassButton isHeadingMode={true} heading={90} onToggle={jest.fn()} />);

    const button = screen.getByTestId('compass-button');
    expect(button.props.accessibilityLabel).toBe('Retour nord en haut');
    const buttonStyle = Array.isArray(button.props.style)
      ? Object.assign({}, ...button.props.style.filter(Boolean))
      : button.props.style;
    expect(buttonStyle.borderColor).toBe('#4285F4');
    expect(buttonStyle.borderWidth).toBe(2);
  });

  it('renders compass arrow', () => {
    render(<CompassButton isHeadingMode={false} heading={null} onToggle={jest.fn()} />);

    expect(screen.getByTestId('compass-button-arrow')).toBeTruthy();
  });
});
