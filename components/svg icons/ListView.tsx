import * as React from "react";

const ListView: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({ color = "#C3C3C3", ...props }) => {
  console.log("ListView color:", color); // Debug log
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="17"
      fill="none"
      viewBox="0 0 16 17"
      {...props}
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6 15.294h4c3.334 0 4.667-1.334 4.667-4.667v-4c0-3.333-1.333-4.667-4.667-4.667H6c-3.333 0-4.666 1.334-4.666 4.667v4c0 3.333 1.333 4.667 4.666 4.667M6.667 1.96v13.334M6.667 6.293h8M6.667 10.96h8"
      ></path>
    </svg>
  );
};

export default ListView;