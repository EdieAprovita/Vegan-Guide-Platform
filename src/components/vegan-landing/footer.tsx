"use client";

export function Footer() {
  return (
    <div className="relative min-h-[400px] w-full bg-green-900 px-4 pt-12 sm:min-h-[492px] sm:px-6 sm:pt-16 lg:px-24 lg:pt-[162px] xl:px-[93px]">
      <div className="absolute bottom-0 left-0 h-[300px] w-full bg-green-800/80 sm:h-[374px]" />

      <div className="relative z-20 flex flex-col gap-8 sm:gap-12 lg:flex-row lg:gap-[68px]">
        <div className="max-w-full flex-1 text-center lg:max-w-[380px] lg:text-left">
          <div className="mb-6 font-['Clicker_Script'] text-3xl font-normal text-white sm:mb-8 sm:text-4xl lg:text-[54px]">
            Verde Guide
          </div>

          <div className="mb-8 font-['Playfair_Display'] text-sm leading-relaxed font-normal text-white sm:mb-12 sm:text-base">
            Your comprehensive companion for plant-based living. We provide everything you need to
            thrive on plants, from delicious recipes to sustainable lifestyle tips. Join our
            community committed to health, compassion, and environmental stewardship.
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 sm:gap-6 lg:justify-start">
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-green-500 transition-colors hover:bg-green-400 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </div>

            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-green-500 transition-colors hover:bg-green-400 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-green-500 transition-colors hover:bg-green-400 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.750-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
              </svg>
            </div>

            <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-green-500 transition-colors hover:bg-green-400 sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-12 lg:gap-[68px]">
          <div className="min-w-0 text-center sm:min-w-[136px] sm:text-left">
            <div className="mb-6 font-['Playfair_Display'] text-xl font-bold text-white sm:mb-8 sm:text-2xl lg:mb-[55px] lg:text-[26px]">
              Explore
            </div>

            <div className="space-y-2 font-['Playfair_Display'] text-sm leading-relaxed font-normal text-white sm:space-y-3 sm:text-base lg:text-lg lg:leading-[42px]">
              <div className="cursor-pointer transition-colors hover:text-green-200">Recipes</div>
              <div className="cursor-pointer transition-colors hover:text-green-200">Nutrition</div>
              <div className="cursor-pointer transition-colors hover:text-green-200">
                Lifestyle Tips
              </div>
              <div className="cursor-pointer transition-colors hover:text-green-200">Community</div>
            </div>
          </div>

          <div className="min-w-0 text-center sm:min-w-[136px] sm:text-left">
            <div className="mb-6 font-['Playfair_Display'] text-xl font-bold text-white sm:mb-8 sm:text-2xl lg:mb-[55px] lg:text-[26px]">
              Company
            </div>

            <div className="space-y-2 font-['Playfair_Display'] text-sm leading-relaxed font-normal text-white sm:space-y-3 sm:text-base lg:text-lg lg:leading-[42px]">
              <div className="cursor-pointer transition-colors hover:text-green-200">
                Our Mission
              </div>
              <div className="cursor-pointer transition-colors hover:text-green-200">
                Privacy Policy
              </div>
              <div className="cursor-pointer transition-colors hover:text-green-200">
                Terms of Service
              </div>
              <div className="cursor-pointer transition-colors hover:text-green-200">FAQ</div>
            </div>
          </div>

          <div className="min-w-0 text-center sm:min-w-[136px] sm:text-left">
            <div className="mb-6 font-['Playfair_Display'] text-xl font-bold text-white sm:mb-8 sm:text-2xl lg:mb-[55px] lg:text-[26px]">
              Contact Us
            </div>

            <div className="max-w-full space-y-4 sm:max-w-[332px] sm:space-y-6">
              <div className="font-['Playfair_Display'] text-sm font-normal text-white sm:text-base lg:text-lg">
                123 Green Street, Plant City, Earth 12345
              </div>

              <div className="font-['Playfair_Display'] text-sm font-normal text-white sm:text-base lg:text-lg">
                +1 555-VERDE-99
              </div>

              <div className="font-['Playfair_Display'] text-sm font-normal text-white sm:text-base lg:text-lg">
                hello@verdeguide.com
              </div>

              <div className="font-['Playfair_Display'] text-sm font-normal text-white sm:text-base lg:text-lg">
                www.verdeguide.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
