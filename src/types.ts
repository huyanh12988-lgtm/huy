export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum AdmissionStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface Candidate {
  id: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  identificationNumber: string;
  examRegistrationNumber: string;
  birthPlace: string;
  ethnicity: string;
  gender: string;
  permanentAddress: string;
  highSchool: string;
  highSchoolProvinceCode: string;
  highSchoolCode: string;
  graduationYear: string;
  consultantName: string;
  mathScore: number;
  literatureScore: number;
  englishScore: number;
  physicsScore?: number;
  chemistryScore?: number;
  biologyScore?: number;
  historyScore?: number;
  geographyScore?: number;
  civicEducationScore?: number;
  informaticsScore?: number;
  russianScore?: number;
  chineseScore?: number;
  totalScore: number;
  status: AdmissionStatus;
  major: string;
  level: string;
  system: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  candidateId: string;
  title: string;
  description: string;
  date: string;
}
