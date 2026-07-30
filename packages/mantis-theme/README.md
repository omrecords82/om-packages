# @om/mantis-theme

MUI theme pack extracted from CodedThemes Mantis React TS 4.2.0.

Wrap your app with `ConfigProvider` from `@om/mantis-shared`, then `ThemeCustomization`.

```tsx
import { ConfigProvider } from '@om/mantis-shared';
import ThemeCustomization from '@om/mantis-theme';

export function App({ children }) {
  return (
    <ConfigProvider>
      <ThemeCustomization>{children}</ThemeCustomization>
    </ConfigProvider>
  );
}
```
