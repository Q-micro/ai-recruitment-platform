/**
 * The function `getCandidateTheme` returns a theme object based on the mode (dark or light) provided
 * as an argument.
 * @param mode - The `mode` parameter in the `getCandidateTheme` function determines whether to return
 * the dark theme or the light theme based on the value passed to it. If `mode` is equal to "dark", the
 * function will return the dark theme object with various styling properties for different elements on
 * the page
 * @returns The `getCandidateTheme` function returns a theme object based on the `mode` parameter
 * provided. If the `mode` is "dark", it returns a dark theme object with various color values for
 * different elements like page background, shell background, card background, text color, accent
 * color, button styles, and more. If the `mode` is not "dark", it returns a light theme object
 */

export const getCandidateTheme = (mode) => {
  const dark = {
    // Dark mode gradient: #FC9548 -> #F85124 -> #7B1523
    pageBg: "linear-gradient(-45deg, #FC9548, #F85124, #7B1523)",
    // Animated settings
    bgSize: "400% 400%",
    bgAnim: "gradientAnim 15s ease infinite",

    shellBg: "rgba(18, 24, 38, 0.72)",
    cardBg: "rgba(16, 23, 38, 0.96)",
    cardBorder: "rgba(255,255,255,0.06)",
    text: "#F7F8FC",
    subtext: "#B6C0D3",
    accent: "#FF9A3D",
    accentHover: "#FFB05F",
    danger: "#FF6B6B",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(255,255,255,0.08)",
    nav: "rgba(18, 10, 14, 0.82)",
    navBorder: "rgba(255, 154, 61, 0.16)",
    bottomNavBg: "rgba(24, 12, 17, 0.92)",
    bottomNavBorder: "rgba(255, 154, 61, 0.22)",
    bottomNavShadow: "0 18px 45px rgba(0,0,0,0.48)",
    bottomNavActiveBg: "rgba(255,154,61,0.18)",
    buttonBg: "linear-gradient(90deg, #FF9A3D 0%, #F85124 100%)",
    buttonHoverBg: "linear-gradient(90deg, #FFB05F 0%, #FF6A3D 100%)",
    hoverBg: "rgba(255, 154, 61, 0.10)",
    avatarText: "#FFFFFF",
  };

  const light = {
    // Light mode gradient: #FD9A1A -> #F5C872 -> #F7C89E
    pageBg: "linear-gradient(-45deg, #FD9A1A, #F5C872, #F7C89E)",
    bgSize: "400% 400%",
    bgAnim: "gradientAnim 15s ease infinite",

    shellBg: "rgba(255, 255, 255, 0.62)",
    cardBg: "rgba(255, 252, 248, 0.98)",
    cardBorder: "rgba(248, 81, 36, 0.08)",
    text: "#1A120E",
    subtext: "#6A4637",
    accent: "#F85124",
    accentHover: "#D9441C",
    danger: "#B42318",
    inputBg: "#FFFDFB",
    inputBorder: "rgba(248, 81, 36, 0.16)",
    nav: "rgba(255, 251, 247, 0.88)",
    navBorder: "rgba(248, 81, 36, 0.08)",
    bottomNavBg: "rgba(255,255,255,0.94)",
    bottomNavBorder: "rgba(248, 81, 36, 0.12)",
    bottomNavShadow: "0 18px 45px rgba(80,45,25,0.18)",
    bottomNavActiveBg: "rgba(248,81,36,0.10)",
    buttonBg: "linear-gradient(90deg, #FC9D16 0%, #FEA16C 100%)",
    buttonHoverBg: "linear-gradient(90deg, #F68E0E 0%, #F85124 100%)",
    hoverBg: "rgba(248, 81, 36, 0.08)",
    avatarText: "#FFFFFF",
  };

  return mode === "dark" ? dark : light;
};
