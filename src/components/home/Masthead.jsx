import { profile } from '../../data/siteData'

export default function Masthead() {
  return (
    <section className="px-5 pb-10 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-[72px] lg:pb-[72px] lg:pt-[120px]">
      <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-[1.35fr_.65fr] lg:gap-16">
        <div>
          <h1 className="m-0 text-[clamp(48px,10.5vw,168px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]">
            {profile.name}
          </h1>
        </div>
        <div className="pb-2">
          <p className="mb-[22px] text-[clamp(15px,1.4vw,19px)] leading-[1.5]">
            {profile.manifesto}
          </p>
        </div>
      </div>
    </section>
  )
}
