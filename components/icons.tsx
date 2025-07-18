
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  type: 'audience' | 'story' | 'generate' | 'reset' | 'script' | 'thumbnail' | 'video' | 'play' | 'pause' | 'check' | 'cross' | 'spinner' | 'linkedin' | 'twitter' | 'instagram' | 'download';
}

export const Icon: React.FC<IconProps> = ({ type, className, ...props }) => {
  const icons: Record<IconProps['type'], React.ReactNode> = {
    audience: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.14 5.448a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1 4.682-2.72m7.14-5.448a7.5 7.5 0 1 0-10.606 0M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
    story: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c1.356 0 2.673-.11 3.955-.322M12 21c-1.356 0-2.673-.11-3.955-.322m0-12.455a4.5 4.5 0 0 1 .916-3.163M16.045 3.228a4.5 4.5 0 0 0-.916-3.163m-4.5 3.163a4.5 4.5 0 0 1 4.5 0m-4.5 0a4.5 4.5 0 0 0-4.5 0m3.75-3.163a4.5 4.5 0 0 1-4.5-3.163M3.163 4.572a4.5 4.5 0 0 0 4.5 3.163m4.5-3.163a4.5 4.5 0 0 1-4.5 3.163m0-3.163a4.5 4.5 0 0 0-4.5 3.163m0 0a4.5 4.5 0 0 1 3.163 4.5m0-4.5a4.5 4.5 0 0 0 3.163 4.5m0-4.5a4.5 4.5 0 0 1-3.163 4.5m7.81-1.218a.75.75 0 0 0-1.06 0M15.938 12a.75.75 0 0 1 0 1.06M17.25 10.875a.75.75 0 0 0-1.06 0M12 15.75a.75.75 0 0 1 0-1.06M10.875 17.25a.75.75 0 0 0 0-1.06M9.75 15.75a.75.75 0 0 1-1.06 0M8.625 14.25a.75.75 0 0 0-1.06 0" />,
    generate: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />,
    reset: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.18-3.185m-7.524 0h-4.992" />,
    script: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />,
    thumbnail: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />,
    video: <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />,
    play: <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />,
    pause: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-6-13.5v13.5" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    cross: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    spinner: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.18-3.185m-7.524 0h-4.992" />,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
    twitter: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>,
    download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  };
  
  const icon = icons[type];
  const animate = type === 'spinner' ? 'animate-spin' : '';
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} ${animate}`} {...props}>
      {icon}
    </svg>
  );
};