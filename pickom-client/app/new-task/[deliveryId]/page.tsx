import PageClient from './PageClient';

export async function generateStaticParams() {
  return [{ deliveryId: "1" }];
}

export default async function Page() {
  return <PageClient />;
}
