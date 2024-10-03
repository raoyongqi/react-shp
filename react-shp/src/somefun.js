
export const getColor = (majorVege) => {
  switch (majorVege) {
    case '草甸': return 'purple';
    case '草原': return 'blue';
    case '草丛': return 'yellow';
    default: return 'gray'; // Default color if not matched
  }
};

export   const provinceCenters = {
  '内蒙古自治区': [40.8173, 111.7653],   // 内蒙古自治区
  '四川省': [30.6592, 104.0665],         // 四川省
  '新疆维吾尔自治区': [43.7934, 87.6272], // 新疆维吾尔自治区
  '甘肃省': [36.0583, 103.8343],         // 甘肃省
  '西藏自治区': [29.6475, 91.1175],      // 西藏自治区
  '青海省': [36.6171, 101.7789],         // 青海省
};