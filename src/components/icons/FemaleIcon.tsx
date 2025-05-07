"use client"
import Svg, { Path, Circle } from "react-native-svg"
import { useTheme } from "../../context/ThemeContext"

type Props = {
  size?: number
  color?: string
  isActive?: boolean
}

export default function FemaleIcon({ size = 24, color, isActive = false }: Props) {
  const { colors } = useTheme()
  const iconColor = color || (isActive ? colors.text.inverse : colors.text.primary)
  const strokeWidth = size > 30 ? 2.5 : 2

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="5" stroke={iconColor} strokeWidth={strokeWidth} />
      <Path d="M12 14V20" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 17H15" stroke={iconColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  )
}
