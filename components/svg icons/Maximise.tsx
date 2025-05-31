import * as React from "react";

const Maximise: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    {...props} // Make sure to spread props here to allow className etc.
  >
    <path
      stroke="currentColor" // Change from #292D32 to currentColor
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="0.875"
      d="M1.167 5.821v-.572c0-2.916 1.166-4.083 4.083-4.083h3.5c2.917 0 4.083 1.167 4.083 4.083v3.5c0 2.917-1.166 4.084-4.083 4.084h-.583"
    ></path>
    <path
      stroke="currentColor" // Change from #292D32 to currentColor
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="0.875"
      d="m7.583 6.417 2.923-2.929h-2.34M10.506 3.488v2.34M6.417 9.421v1.576c0 1.312-.525 1.837-1.838 1.837H3.004c-1.312 0-1.837-.525-1.837-1.838V9.422c0-1.312.525-1.837 1.837-1.837H4.58c1.313 0 1.838.525 1.838 1.837"
    ></path>
  </svg>
);

export default Maximise;