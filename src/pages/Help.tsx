
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Video, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Phone,
  Send
} from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqItems = [
    {
      question: "What is an ASIN and where can I find it?",
      answer: "ASIN (Amazon Standard Identification Number) is a unique 10-character identifier assigned by Amazon. You can find it in the product URL, product details section, or by searching for 'ASIN' on the product page."
    },
    {
      question: "How accurate is the scraped data?",
      answer: "Our scraper provides highly accurate data directly from Amazon's product pages. However, prices and availability can change frequently, so we recommend checking the timestamp of your scraping results."
    },
    {
      question: "What data fields can I extract?",
      answer: "You can extract ASIN, product title, main image URL, current price, Buy Box winner information, and direct product link. More fields may be added based on user feedback."
    },
    {
      question: "Are there any rate limits?",
      answer: "To ensure optimal performance and respect Amazon's servers, we implement reasonable rate limiting. Free users can scrape up to 100 products per day, while premium users get higher limits."
    },
    {
      question: "Can I export my scraped data?",
      answer: "Yes! You can export your scraping history as CSV, JSON, or Excel files from the History page. This makes it easy to analyze data in your preferred tools."
    },
    {
      question: "Is this service legal?",
      answer: "Yes, our service scrapes publicly available information from Amazon's product pages. We comply with robots.txt guidelines and rate limiting best practices."
    }
  ];

  const quickGuides = [
    {
      title: "Getting Started",
      description: "Learn how to scrape your first product",
      duration: "2 min read",
      icon: Book
    },
    {
      title: "Advanced Filtering",
      description: "Select specific data fields to extract",
      duration: "3 min read", 
      icon: Search
    },
    {
      title: "Bulk Processing",
      description: "Process multiple ASINs efficiently",
      duration: "5 min read",
      icon: Clock
    },
    {
      title: "Data Export Guide",
      description: "Export and analyze your data",
      duration: "4 min read",
      icon: CheckCircle
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
  };

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <HelpCircle className="h-10 w-10 text-blue-500" />
            Help & Support
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get help with Amazon Product Scraper. Find answers, tutorials, and contact our support team.
          </p>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="faq" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Contact
            </TabsTrigger>
            <TabsTrigger value="status" className="text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Status
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-gray-700">
                      <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-300">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickGuides.map((guide, index) => (
                <Card key={index} className="bg-gray-900 border-gray-700 hover:border-blue-600 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <guide.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{guide.title}</h3>
                        <p className="text-gray-400 mb-3">{guide.description}</p>
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {guide.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Video Tutorials</h2>
                <p className="text-blue-100 mb-6">Watch step-by-step video guides to master the Amazon Product Scraper.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Watch Tutorials
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                      <Input
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-green-600 rounded-lg">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Email Support</h3>
                        <p className="text-gray-400">support@amazonscraper.com</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      We typically respond within 24 hours during business days.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-purple-600 rounded-lg">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Phone Support</h3>
                        <p className="text-gray-400">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Available Monday-Friday, 9 AM - 6 PM EST
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Response Times</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">General Inquiries</span>
                        <Badge className="bg-green-600">24 hours</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Technical Issues</span>
                        <Badge className="bg-blue-600">12 hours</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Billing Questions</span>
                        <Badge className="bg-purple-600">6 hours</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white font-medium">API Service</span>
                    </div>
                    <Badge className="bg-green-600">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white font-medium">Web Scraper</span>
                    </div>
                    <Badge className="bg-green-600">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-white font-medium">Database</span>
                    </div>
                    <Badge className="bg-yellow-600">Degraded</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white font-medium">Export Service</span>
                    </div>
                    <Badge className="bg-green-600">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-white font-medium">Database Performance Issues</span>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">Investigating</Badge>
                    </div>
                    <p className="text-gray-400 text-sm">
                      We're experiencing slower than normal database response times. 
                      Our team is investigating and working on a fix.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">Started: 2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Help;
