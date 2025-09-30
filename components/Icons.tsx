import React from 'react';

export const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-5.197M15 15.803A5.97 5.97 0 0012 15a5.97 5.97 0 00-3 0.803" />
  </svg>
);

export const GGSLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <image href="data:image/png;base64,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" width="512" height="512"/>
  </svg>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SignOutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);