"use client";

export function Footer() {
  return (
    <div className="w-full min-h-[400px] sm:min-h-[492px] relative px-4 sm:px-6 lg:px-24 xl:px-[93px] pt-12 sm:pt-16 lg:pt-[162px] bg-green-900">
      <div className="w-full h-[300px] sm:h-[374px] absolute bottom-0 left-0 bg-green-800/80" />

      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-[68px] relative z-20">
        <div className="flex-1 max-w-full lg:max-w-[380px] text-center lg:text-left">
          <div className="text-white font-['Clicker_Script'] text-3xl sm:text-4xl lg:text-[54px] font-normal mb-6 sm:mb-8">
            Verde Guide
          </div>

          <div className="text-white font-['Playfair_Display'] text-sm sm:text-base font-normal leading-relaxed mb-8 sm:mb-12">
            Your comprehensive companion for plant-based living. We provide
            everything you need to thrive on plants, from delicious recipes to
            sustainable lifestyle tips. Join our community committed to health,
            compassion, and environmental stewardship.
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center lg:justify-start gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.750-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
              </svg>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 lg:gap-[68px]">
          <div className="min-w-0 sm:min-w-[136px] text-center sm:text-left">
            <div className="text-white font-['Playfair_Display'] text-xl sm:text-2xl lg:text-[26px] font-bold mb-6 sm:mb-8 lg:mb-[55px]">
              Explore
            </div>

            <div className="text-white font-['Playfair_Display'] text-sm sm:text-base lg:text-lg font-normal leading-relaxed lg:leading-[42px] space-y-2 sm:space-y-3">
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                Recipes
              </div>
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                Nutrition
              </div>
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                Lifestyle Tips
              </div>
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                Community
              </div>
            </div>
          </div>

          <div className="min-w-0 sm:min-w-[136px] text-center sm:text-left">
            <div className="text-white font-['Playfair_Display'] text-xl sm:text-2xl lg:text-[26px] font-bold mb-6 sm:mb-8 lg:mb-[55px]">
              Company
            </div>

            <div className="text-white font-['Playfair_Display'] text-sm sm:text-base lg:text-lg font-normal leading-relaxed lg:leading-[42px] space-y-2 sm:space-y-3">
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                Our Mission
              </div>
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                Privacy Policy
              </div>
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                Terms of Service
              </div>
              <div className="cursor-pointer hover:text-green-200 transition-colors">
                FAQ
              </div>
            </div>
          </div>

          <div className="min-w-0 sm:min-w-[136px] text-center sm:text-left">
            <div className="text-white font-['Playfair_Display'] text-xl sm:text-2xl lg:text-[26px] font-bold mb-6 sm:mb-8 lg:mb-[55px]">
              Contact Us
            </div>

            <div className="max-w-full sm:max-w-[332px] space-y-4 sm:space-y-6">
              <div className="text-white font-['Playfair_Display'] text-sm sm:text-base lg:text-lg font-normal">
                123 Green Street, Plant City, Earth 12345
              </div>

              <div className="text-white font-['Playfair_Display'] text-sm sm:text-base lg:text-lg font-normal">
                +1 555-VERDE-99
              </div>

              <div className="text-white font-['Playfair_Display'] text-sm sm:text-base lg:text-lg font-normal">
                hello@verdeguide.com
              </div>

              <div className="text-white font-['Playfair_Display'] text-sm sm:text-base lg:text-lg font-normal">
                www.verdeguide.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
