type PageHeaderProps = {
  title: string;
  description: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="page-banner">
      <div className="mx-auto max-w-[1200px] px-6 pt-28 pb-14 lg:px-8">
        <h1 className="page-title">{title}</h1>
        <p className="page-description mt-4 max-w-2xl">{description}</p>
      </div>
    </div>
  );
}
