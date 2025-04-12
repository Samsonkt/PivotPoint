import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white mt-12 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-2">
                  <i className="fas fa-route"></i>
                </div>
                <span className="text-sm font-medium text-neutral-800">Pivot Point</span>
              </div>
            </Link>
            <span className="ml-3 text-sm text-neutral-500">© {new Date().getFullYear()} Pivot Point, Inc.</span>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-400 hover:text-neutral-500">
              <span className="sr-only">Help Center</span>
              <i className="fas fa-question-circle"></i>
            </a>
            <a href="#" className="text-neutral-400 hover:text-neutral-500">
              <span className="sr-only">Privacy</span>
              <i className="fas fa-shield-alt"></i>
            </a>
            <a href="#" className="text-neutral-400 hover:text-neutral-500">
              <span className="sr-only">Terms</span>
              <i className="fas fa-file-contract"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
