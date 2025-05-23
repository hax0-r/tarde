import { FaEnvelope, FaPhone } from 'react-icons/fa6'
import UserDashboardLeftBar from '../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar'
import { Button } from '../../../Components/ui/button'
import { FaQuestionCircle } from 'react-icons/fa';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../Components/ui/accordion';
import { Link } from 'react-router';

const Help = () => {
  return (
    <UserDashboardLeftBar breadcrumb="Help">
      <h2 className="md:text-3xl text-xl mt-4 tracking-wide font-semibold">Help & Support</h2>
      <p className="text-sm opacity-70 mt-2">Get assistance for your trading experience.</p>

      <div className="md:grid-cols-3 grid-cols-1 grid md:gap-7 gap-2 items-start">


        {/* FAQ Section */}
        <div className="mt-6 md:col-span-2 w-full">
          <h3 className="text-lg flex items-center gap-2">
            <FaQuestionCircle className="text-[#6d45b9]" /> Frequently Asked Questions
          </h3>

          <div className="mt-3">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I deposit funds?</AccordionTrigger>
                <AccordionContent className='text-[#ffffff94]'>
                  Navigate to the "Wallet" section, choose your preferred payment method, and follow the instructions provided.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How do I withdraw earnings?</AccordionTrigger>
                <AccordionContent className='text-[#ffffff94]'>
                  Go to "Withdraw Funds," select a payment method, and confirm your withdrawal request. Withdrawals are processed within 24 hours.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Is my money secure on this platform?</AccordionTrigger>
                <AccordionContent className='text-[#ffffff94]'>
                  Yes, we implement high-grade encryption and multi-layer security to ensure your funds are protected.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                <AccordionContent className='text-[#ffffff94]'>
                  Click on "Forgot Password" on the login page. You will receive an email with instructions to reset your password securely.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>What is the minimum deposit required?</AccordionTrigger>
                <AccordionContent className='text-[#ffffff94]'>
                  The minimum deposit amount is $50 for most payment methods. For some methods, higher minimums may apply.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>Can I use multiple payment methods?</AccordionTrigger>
                <AccordionContent className='text-[#ffffff94]'>
                  Yes, you can use multiple payment methods for both deposits and withdrawals. Ensure all accounts are verified.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>How can I contact customer support?</AccordionTrigger>
                <AccordionContent className='text-[#ffffff94]'>
                  You can reach out to us via email at support@tradingapp.com option available in the "Help" section.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>

        {/* Contact Support */}
        <div className="mt-8 p-5 border border-[#ffffff3b] rounded-lg bg-[#ffffff1c]">
          <h3 className="text-lg font-semibold">Need More Help?</h3>
          <p className="text-sm opacity-70 mt-2">Contact our support team for further assistance.</p>

          <div className="flex flex-col gap-3 mt-4">
            <Button size={"lg"} className="bg-[#6d45b9] flex items-center gap-2">
              <FaPhone /> +1 234 567 890
            </Button>
            <Link to={"mailto:support@wealthwaytarde.com"} className='w-full'>
              <Button size={"lg"} className="bg-[#6d45b9] flex items-center w-full gap-2">
                <FaEnvelope /> support@wealthwaytarde.com
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </UserDashboardLeftBar>
  )
}

export default Help