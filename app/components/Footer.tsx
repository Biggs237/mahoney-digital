import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between gap-y-8">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center">
                <span class="text-white text-xs font-semibold tracking-tighter">MD</span>
              </div>
              <span class="font-semibold text-white text-lg tracking-tighter">Mahoney Digital</span>
            </div>
            <p class="text-sm max-w-xs">Quiet, consistent work for local businesses that deserve better websites.</p>
            <p class="text-xs mt-4">Chillicothe, Ohio</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8 text-sm">
            <div>
              <div class="font-medium text-white mb-3">Company</div>
              <div class="space-y-2">
                <Link href="#process" className="block hover:text-white transition-colors">How it works</Link>
                <Link href="#packages" className="block hover:text-white transition-colors">Pricing</Link>
                <a href="https://x.com/Biggs237" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Journal on X</a>
              </div>
            </div>
            <div>
              <div class="font-medium text-white mb-3">Connect</div>
              <div class="space-y-2">
                <a href="mailto:hello@mahoneydigital.net" className="block hover:text-white transition-colors">hello@mahoneydigital.net</a>
                <a href="tel:7404928601" className="block hover:text-white transition-colors">(740) 492-8601</a>
                <a href="https://x.com/Biggs237" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">@Biggs237</a>
              </div>
            </div>
            <div class="col-span-2 md:col-span-1">
              <div class="font-medium text-white mb-3">Legal</div>
              <div class="space-y-2 text-xs">
                <div>© {new Date().getFullYear()} Mahoney Digital. All rights reserved.</div>
                <div>Built with discipline in Ohio.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
