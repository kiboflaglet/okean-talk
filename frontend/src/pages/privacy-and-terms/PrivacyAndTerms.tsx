
const PrivacyAndTerms = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Legal Information</h1>

      {/* Privacy Policy */}
      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Privacy Policy</h2>
        <p>
          We respect your privacy. This app collects only basic user information
          needed for authentication and chat functionality. All data is stored
          securely on Supabase. We do not share your data with third parties
          without consent.
        </p>
        <h3 className="text-xl font-semibold mt-2">Google Authentication</h3>
        <p>
          We use Google OAuth for authentication. Your account information is
          handled by Google and Supabase. We do not store your Google password.
        </p>
        <h3 className="text-xl font-semibold mt-2">Contact</h3>
        <p>Email us at kiboflaglet@gmail.com for privacy inquiries.</p>
      </section>

      {/* Terms of Service */}
      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Terms of Service</h2>
        <p>
          By using Okean Talk, you agree to follow our rules and use the app
          responsibly. You must be at least 13 years old to use the app.
        </p>
        <p>
          You are responsible for your content in chat rooms. Do not spam,
          harass, or share illegal content. We may suspend or remove users
          violating these terms.
        </p>
        <p>
          We reserve the right to update these terms and policies at any time.
          Changes will be effective immediately upon posting.
        </p>
        <h3 className="text-xl font-semibold mt-2">Disclaimer</h3>
        <p>
          The app is provided "as-is". We are not liable for data loss, user
          disputes, or any damages arising from using the app.
        </p>
      </section>
    </div>
  );
};

export default PrivacyAndTerms;
