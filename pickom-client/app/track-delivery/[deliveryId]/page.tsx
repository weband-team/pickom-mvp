import PageClient from './PageClient';

export async function generateStaticParams() {
  return [{ deliveryId: "1" }];
}

export default async function Page({ params }: { params: Promise<{ deliveryId: string }> }) {
  return <PageClient params={params} />;
}
