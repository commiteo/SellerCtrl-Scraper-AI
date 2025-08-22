
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ValidatedForm } from "@/components/ui/validated-form";
import { ValidatedInput, ValidatedTextarea } from "@/components/ui/validated-input";
import { ValidationSchemas } from "@/lib/validation";
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

  const handleContactSubmit = async (data: any) => {
    console.log('Contact form submitted:', data);
    // Here you would typically send the data to your backend
    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
  };

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 font-inter">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#FFFFFF] flex items-center justify-center gap-3 font-inter">
            <HelpCircle className="h-10 w-10 text-[#FF7A00]" />
            Help & Support
          </h1>
          <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
            Get help with Amazon Product Scraper. Find answers, tutorials, and contact our support team.
          </p>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#1A1A1A] border-[#2A2A2A]">
            <TabsTrigger value="faq" className="text-[#E0E0E0] data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white font-inter">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="text-[#E0E0E0] data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white font-inter">
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-[#E0E0E0] data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white font-inter">
              Contact
            </TabsTrigger>
            <TabsTrigger value="status" className="text-[#E0E0E0] data-[state=active]:bg-[#FF7A00] data-[state=active]:text-white font-inter">
              Status
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="bg-[#1F1F1F] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
                  <Search className="h-5 w-5 text-[#FF7A00]" />
                  Search FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#171717] border-[#2A2A2A] text-[#E0E0E0] placeholder-[#B0B0B0] font-inter"
                />
              </CardContent>
            </Card>

            <Card className="bg-[#1F1F1F] border-[#2A2A2A] shadow-[0_4px_40px_0_rgba(0,0,0,0.10)] rounded-xl">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF]">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-[#2A2A2A]">
                      <AccordionTrigger className="text-[#FFFFFF] hover:text-[#FF7A00] text-left font-inter">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-[#E0E0E0]">
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
                <Card 
                  key={index}
                  className="bg-[#1F1F1F] border-[#2A2A2A] hover:border-[#FF7A00] transition-colors cursor-pointer shadow-md rounded-xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#FF7A00] rounded-lg shadow-orange-500/30">
                        <guide.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2 font-inter">{guide.title}</h3>
                        <p className="text-[#B0B0B0] mb-3">{guide.description}</p>
                        <Badge variant="secondary" className="bg-[#171717] text-[#E0E0E0]">
                          {guide.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-[#1A1A1A] to-[#171717] border-[#FF7A00] shadow-orange-500/20">
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-[#FF7A00] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">Video Tutorials</h2>
                <p className="text-[#E0E0E0] mb-6">Watch step-by-step video guides to master the Amazon Product Scraper.</p>
                <Button className="bg-[#FF7A00] hover:bg-[#FF9100] text-white shadow-[0_0_8px_2px_#FF7A00] font-inter transition-shadow">
                  Watch Tutorials
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1F1F1F] border-[#2A2A2A] shadow-md rounded-xl">
                <CardHeader>
                  <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#FF7A00]" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ValidatedForm
                    schema={ValidationSchemas.contactForm}
                    initialData={contactForm}
                    onSubmit={handleContactSubmit}
                    submitText="Send Message"
                    showValidationSummary={false}
                    className="space-y-4"
                  >
                    <ValidatedInput
                      fieldName="name"
                      label="Name"
                      placeholder="Enter your full name"
                      className="bg-[#171717] border-[#2A2A2A] text-[#FAFAFA] font-inter"
                      required
                    />
                    
                    <ValidatedInput
                      fieldName="email"
                      label="Email"
                      type="email"
                      placeholder="Enter your email address"
                      className="bg-[#171717] border-[#2A2A2A] text-[#FAFAFA] font-inter"
                      required
                    />
                    
                    <ValidatedInput
                      fieldName="subject"
                      label="Subject"
                      placeholder="Enter the subject of your message"
                      className="bg-[#171717] border-[#2A2A2A] text-[#FAFAFA] font-inter"
                      required
                    />
                    
                    <ValidatedTextarea
                      fieldName="message"
                      label="Message"
                      placeholder="Enter your message here..."
                      className="bg-[#171717] border-[#2A2A2A] text-[#FAFAFA] min-h-[120px] font-inter"
                      showCharacterCount
                      maxLength={1000}
                      required
                    />
                  </ValidatedForm>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-[#1F1F1F] border-[#2A2A2A] shadow rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-[#29C36A] rounded-lg">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#FAFAFA]">Email Support</h3>
                        <p className="text-[#B0B0B0]">support@amazonscraper.com</p>
                      </div>
                    </div>
                    <p className="text-[#E0E0E0] text-sm">
                      We typically respond within 24 hours during business days.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1F1F1F] border-[#2A2A2A] shadow rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-[#6C50FA] rounded-lg">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#FAFAFA]">Phone Support</h3>
                        <p className="text-[#B0B0B0]">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <p className="text-[#E0E0E0] text-sm">
                      Available Monday–Friday, 9 AM – 6 PM EST
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#1F1F1F] border-[#2A2A2A] shadow rounded-xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">Response Times</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#E0E0E0]">General Inquiries</span>
                        <Badge className="bg-[#29C36A] text-white">24 hours</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#E0E0E0]">Technical Issues</span>
                        <Badge className="bg-[#FF7A00] text-white">12 hours</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#E0E0E0]">Billing Questions</span>
                        <Badge className="bg-[#6C50FA] text-white">6 hours</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <Card className="bg-[#1F1F1F] border-[#2A2A2A] shadow rounded-xl">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF] flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#29C36A]" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#171717]/80 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#29C36A] rounded-full"></div>
                      <span className="text-[#FAFAFA] font-medium">API Service</span>
                    </div>
                    <Badge className="bg-[#29C36A] text-white">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#171717]/80 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#29C36A] rounded-full"></div>
                      <span className="text-[#FAFAFA] font-medium">Web Scraper</span>
                    </div>
                    <Badge className="bg-[#29C36A] text-white">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#171717]/80 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#FFD600] rounded-full"></div>
                      <span className="text-[#FAFAFA] font-medium">Database</span>
                    </div>
                    <Badge className="bg-[#FFD600] text-black">Degraded</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#171717]/80 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#29C36A] rounded-full"></div>
                      <span className="text-[#FAFAFA] font-medium">Export Service</span>
                    </div>
                    <Badge className="bg-[#29C36A] text-white">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1F1F1F] border-[#2A2A2A] shadow rounded-xl">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF]">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-[#FFD600] pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-[#FFD600]" />
                      <span className="text-[#FFFFFF] font-medium">Database Performance Issues</span>
                      <Badge variant="outline" className="border-[#FFD600] text-[#FFD600]">Investigating</Badge>
                    </div>
                    <p className="text-[#B0B0B0] text-sm">
                      We're experiencing slower than normal database response times. 
                      Our team is investigating and working on a fix.
                    </p>
                    <p className="text-[#7A7A7A] text-xs mt-2">Started: 2 hours ago</p>
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
