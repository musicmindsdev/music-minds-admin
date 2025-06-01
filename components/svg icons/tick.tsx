import * as React from "react";

const Tick: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="51"
    fill="none"
    viewBox="0 0 50 51"
  >
    <path
      fill="#00A424"
      d="M25 4.666c-11.48 0-20.833 9.354-20.833 20.833 0 11.48 9.354 20.834 20.833 20.834s20.833-9.355 20.833-20.834S36.48 4.666 25 4.666m9.958 16.042L23.146 32.52a1.56 1.56 0 0 1-2.209 0l-5.896-5.896a1.57 1.57 0 0 1 0-2.208 1.57 1.57 0 0 1 2.209 0l4.791 4.792L32.75 18.499a1.57 1.57 0 0 1 2.208 0 1.57 1.57 0 0 1 0 2.209"
    ></path>
  </svg>
);

export default Tick;
