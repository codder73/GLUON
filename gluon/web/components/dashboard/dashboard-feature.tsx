'use client';

import { AppHero } from '../ui/ui-layout';

const links: { label: string; href: string }[] = [
  { label: 'Solana Docs', href: 'https://docs.solana.com/' },
  { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
  { label: 'Solana Cookbook', href: 'https://solanacookbook.com/' },
  { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
  {
    label: 'Solana Developers GitHub',
    href: 'https://github.com/solana-developers/',
  },
];

export default function DashboardFeature() {
  return (
    <div>
      <AppHero title="~Gluon~" subtitle="Say HI to new distruptor Dapp." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <p>
          Get ready and get on your chain of developement!
        </p>
      </div>
    </div>
  );
}
