import { getAllGalleries } from '@/lib/galleries';
import GalleryList from '@/components/GalleryList';

export default function GalleryPage() {
  const galleries = getAllGalleries();
  return <GalleryList galleries={galleries} />;
}
