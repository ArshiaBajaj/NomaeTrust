type MobileShellProps = {
  children: React.ReactNode;
};

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="mx-auto w-full max-w-[390px] lg:rounded-[2.5rem] lg:border-[6px] lg:border-slate-800 lg:bg-slate-800 lg:p-2 lg:shadow-2xl">
      <div className="hidden lg:block">
        <div className="mx-auto mb-1 h-5 w-28 rounded-full bg-slate-900" />
      </div>
      <div className="min-h-[min(100dvh,844px)] overflow-hidden bg-white lg:min-h-[780px] lg:rounded-[2rem]">
        {children}
      </div>
    </div>
  );
}
