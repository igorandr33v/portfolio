export interface Project {
  id: string;
  categoryId: string;
  number: string;
  title: string;
  shortTitle?: string;
  subheading?: string;
  objective?: string;
  services?: string[];
  industry?: string;
  client: string;
  year: string;
  description: string;
  imageUrl?: string;
  galleryImages?: string[];
  tags?: string[];
}

export interface Category {
  id: string;
  number: string;
  name: string;
  fullName: string;
  sectionTitle: string;
}
