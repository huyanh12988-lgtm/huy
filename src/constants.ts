export const MAJORS_DATA = {
  'Cao đẳng': {
    'Hệ chỉ tiêu CNQP': [
      'CNKT Cơ Khí',
      'CNKT Điện, Điện tử',
      'CNKT Hóa học',
      'Công nghệ thông tin',
      'CN Chế tạo máy',
      'Cắt gọt kim loại',
      'Cơ điện tử',
      'TĐH Công nghiệp'
    ],
    'Hệ dân sự': [
      'Công nghệ thông tin',
      'CNKT Điện, Điện tử',
      'CN Chế tạo máy',
      'Kế toán'
    ]
  },
  'Trung cấp': {
    'Hệ chỉ tiêu CNQP': [
      'Cắt gọt kim loại',
      'Nguội Chế tạo',
      'Hàn',
      'Công nghệ Mạ',
      'CNKT Hóa học (Hóa nổ)',
      'Điện Công nghiệp',
      'Kỹ thuật máy lạnh và điều hòa không khí'
    ],
    'Hệ dân sự': [
      'Cắt gọt kim loại',
      'Kỹ thuật máy lạnh và điều hòa không khí'
    ]
  }
};

export const COMBINATIONS = {
  'A00': ['mathScore', 'physicsScore', 'chemistryScore'],
  'A01': ['mathScore', 'physicsScore', 'englishScore'],
  'B00': ['mathScore', 'chemistryScore', 'biologyScore'],
  'C00': ['literatureScore', 'historyScore', 'geographyScore'],
  'D01': ['literatureScore', 'mathScore', 'englishScore'],
  'C01': ['literatureScore', 'mathScore', 'physicsScore'],
  'C02': ['literatureScore', 'mathScore', 'chemistryScore'],
  'C03': ['literatureScore', 'mathScore', 'historyScore'],
  'C04': ['literatureScore', 'mathScore', 'geographyScore'],
  'D07': ['mathScore', 'chemistryScore', 'englishScore'],
  'A0T': ['mathScore', 'physicsScore', 'informaticsScore'],
  'D02': ['literatureScore', 'mathScore', 'russianScore'],
  'D04': ['literatureScore', 'mathScore', 'chineseScore'],
};

export const COMBINATION_LABELS: Record<string, string> = {
  'A00': 'Toán, Lý, Hóa',
  'A01': 'Toán, Lý, Anh',
  'B00': 'Toán, Hóa, Sinh',
  'C00': 'Văn, Sử, Địa',
  'D01': 'Văn, Toán, Anh',
  'C01': 'Văn, Toán, Lý',
  'C02': 'Văn, Toán, Hóa',
  'C03': 'Văn, Toán, Sử',
  'C04': 'Văn, Toán, Địa',
  'D07': 'Toán, Hóa, Anh',
  'A0T': 'Toán, Lý, Tin',
  'D02': 'Văn, Toán, Nga',
  'D04': 'Văn, Toán, Trung',
};
