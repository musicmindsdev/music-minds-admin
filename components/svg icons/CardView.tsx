import * as React from "react";

const CardView: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = "#C3C3C3", ...props }) => {
  console.log("CardView color:", color); // Debug log
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="17"
      fill="none"
      viewBox="0 0 18 17"
      {...props}
    >
      <path
        stroke={color}
        strokeMiterlimit="10"
        strokeWidth="1.5"
        d="m15.62 5.134-2.247 9.02c-.16.673-.76 1.14-1.453 1.14H3.16c-1.007 0-1.727-.987-1.427-1.954L4.54 4.327a1.5 1.5 0 0 1 1.427-1.06h8.2c.633 0 1.16.387 1.38.92.126.287.153.613.073.947Z"
      ></path>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="1.5"
        d="M11.667 15.294h3.186c.86 0 1.534-.727 1.473-1.587l-.66-9.08M7.453 4.88 8.146 2M11.92 4.887l.627-2.893M6.133 8.627h5.334M5.467 11.294H10.8"
      ></path>
    </svg>
  );
};

export default CardView;