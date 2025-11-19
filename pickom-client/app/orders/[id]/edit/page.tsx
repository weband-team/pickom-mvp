import PageClient from './PageClient';

export async function generateStaticParams() {
  return [{ id: "1" }];
}


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <PageClient params={params} />;
}
