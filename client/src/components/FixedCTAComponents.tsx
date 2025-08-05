import { useChat } from '@/hooks/use-chat';
import { ChatWindow } from '@/components/ChatWindow';
import { Button } from '@/components/ui/button';

export function FixedCTAButtons() {
  const chat = useChat();

  return (
    <>
      {/* Example of how to fix the broken CTA buttons */}
      
      {/* Hero Section - Start Your Claim Button */}
      <Button 
        size="lg" 
        className="bg-navy-700 hover:bg-navy-800 text-white"
        onClick={chat.startClaim}
      >
        Start Your Claim
      </Button>

      {/* Free Case Evaluation Button */}
      <Button 
        variant="outline" 
        size="lg"
        onClick={chat.getEvaluation}
      >
        Get My Free Evaluation
      </Button>

      {/* Start My Claim Today Button */}
      <Button 
        className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
        onClick={chat.startClaim}
      >
        Start My Claim Today
      </Button>

      {/* Service Cards Learn More - can be customized per service */}
      <Button 
        variant="link" 
        className="text-navy-600"
        onClick={() => chat.openChat('general_help', 'I want to learn more about disability compensation claims')}
      >
        Learn More
      </Button>

      {/* Chat Window */}
      <ChatWindow
        isOpen={chat.isOpen}
        onClose={chat.closeChat}
        initialIntent={chat.initialIntent}
        prefilledMessage={chat.prefilledMessage}
      />
    </>
  );
}

// Contact section fixes
export function FixedContactInfo() {
  return (
    <div className="space-y-2">
      {/* Fixed email link */}
      <p>
        Email: <a 
          href="mailto:info@valorassist.com?subject=VA Benefits Inquiry" 
          className="text-navy-600 hover:text-navy-800 underline"
        >
          info@valorassist.com
        </a>
      </p>
      
      {/* Fixed phone link for mobile */}
      <p>
        Phone: <a 
          href="tel:+18008271000" 
          className="text-navy-600 hover:text-navy-800 underline"
        >
          1-800-827-1000
        </a>
      </p>
    </div>
  );
}

// Free Case Evaluation Form - functional version
export function FixedCaseEvaluationForm() {
  const chat = useChat();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const branch = formData.get('branch') as string;
    const rating = formData.get('rating') as string;
    const concerns = formData.get('concerns') as string;

    const message = `I would like a free case evaluation. Here are my details:
- Service Branch: ${branch}
- Current Rating: ${rating}
- Primary Concerns: ${concerns}

Please help me understand my options.`;

    chat.openChat('file_claim', message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Service Branch</label>
        <select 
          name="branch" 
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select your branch</option>
          <option value="Army">Army</option>
          <option value="Navy">Navy</option>
          <option value="Air Force">Air Force</option>
          <option value="Marines">Marines</option>
          <option value="Coast Guard">Coast Guard</option>
          <option value="Space Force">Space Force</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Current Rating</label>
        <select 
          name="rating" 
          required
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select current rating</option>
          <option value="0%">0%</option>
          <option value="10%">10%</option>
          <option value="20%">20%</option>
          <option value="30%">30%</option>
          <option value="40%">40%</option>
          <option value="50%">50%</option>
          <option value="60%">60%</option>
          <option value="70%">70%</option>
          <option value="80%">80%</option>
          <option value="90%">90%</option>
          <option value="100%">100%</option>
          <option value="No current rating">No current rating</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Primary Concerns</label>
        <textarea 
          name="concerns"
          required
          placeholder="Describe your primary health concerns or disabilities..."
          className="w-full p-2 border border-gray-300 rounded-md h-20"
        />
      </div>

      <Button type="submit" className="w-full bg-navy-700 hover:bg-navy-800 text-white">
        Get My Free Evaluation
      </Button>

      <ChatWindow
        isOpen={chat.isOpen}
        onClose={chat.closeChat}
        initialIntent={chat.initialIntent}
        prefilledMessage={chat.prefilledMessage}
      />
    </form>
  );
}