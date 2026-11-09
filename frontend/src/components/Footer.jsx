const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-black text-xl mb-4 tracking-tighter">SNKRSTR</h3>
            <p className="text-muted-foreground text-sm">
              The premium destination for exclusive sneakers and streetwear.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>New Arrivals</li>
              <li>Best Sellers</li>
              <li>Brands</li>
              <li>Sale</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Returns</li>
              <li>Size Guide</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-background border border-input px-3 py-2 rounded-md text-sm w-full"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-bold">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SNKRSTR. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
