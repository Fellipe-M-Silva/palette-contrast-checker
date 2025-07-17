export function decompColor(color) {
  const hex = color.startsWith('#') ? color.slice(1) : color

  if (hex.length === 3) {
    const R = hex[0] + hex[0]
    const G = hex[1] + hex[1]
    const B = hex[2] + hex[2]
    return [parseInt(R, 16), parseInt(G, 16), parseInt(B, 16)]
  } else if (hex.length === 6) {
    const R = hex.slice(0, 2)
    const G = hex.slice(2, 4)
    const B = hex.slice(4, 6)
    return [parseInt(R, 16), parseInt(G, 16), parseInt(B, 16)]
  } else {
    console.warn(`Cor hexadecimal inválida para decomposição: ${color}`)
    return [0, 0, 0]
  }
}

function srgbLuminance(color) {
  const c8 = []
  const csRGB = []

  for (const x of color) {
    c8.push(x / 255)
  }

  for (const x of c8) {
    if (x <= 0.03928) {
      csRGB.push(x / 12.92)
    } else {
      csRGB.push(Math.pow((x + 0.055) / 1.055, 2.4))
    }
  }

  const L = 0.2126 * csRGB[0] + 0.7152 * csRGB[1] + 0.0722 * csRGB[2]
  return L
}

export function checkContrast(color1Hex, color2Hex) {
  try {
    const L1 = srgbLuminance(decompColor(color1Hex))
    const L2 = srgbLuminance(decompColor(color2Hex))

    const contr =
      L1 > L2 ? Math.abs((L1 + 0.05) / (L2 + 0.05)) : Math.abs((L2 + 0.05) / (L1 + 0.05))

    return `${contr.toFixed(2)}:1`
  } catch (error) {
    console.error(`Erro ao calcular o contraste entre ${color1Hex} e ${color2Hex}:`, error)
    return 'N/A'
  }
}
