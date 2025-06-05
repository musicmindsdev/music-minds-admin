import * as React from "react";

const Shield: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="21"
    fill="none"
    viewBox="0 0 21 21"
  >
    <path
      stroke="#474747"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.25"
      d="M9.242 2.358 5.083 3.924c-.958.359-1.741 1.492-1.741 2.509v6.192c0 .983.65 2.274 1.441 2.866l3.584 2.675c1.175.883 3.108.883 4.283 0l3.583-2.675c.792-.591 1.442-1.883 1.442-2.867V6.434c0-1.025-.783-2.159-1.742-2.517l-4.158-1.558c-.708-.259-1.842-.259-2.533 0"
    ></path>
    <path
      stroke="#474747"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      strokeWidth="1.25"
      d="M10.5 10.915a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333M10.5 10.918v2.5"
    ></path>
  </svg>
);

export default Shield;
