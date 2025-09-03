// https://vike.dev/Head

import logoUrl from "../assets/logo.svg";

export default function HeadDefault() {
  return (
    <>
      <link rel="icon" href={logoUrl} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedTheme = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = savedTheme || (prefersDark ? 'dark' : 'light');
              document.documentElement.setAttribute('data-theme', theme);
            })();
          `,
        }}
      />
    </>
  );
}
