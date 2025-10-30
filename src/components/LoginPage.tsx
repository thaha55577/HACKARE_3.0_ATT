import React, { useState, useEffect } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { User } from '../types';
import NeuralBackground from './NeuralBackground';
import AnimatedLogo from './AnimatedLogo';

// Resolve base URL safely (cast import.meta to any to avoid TS errors in workspaces without vite types)
const BASE_URL = ((import.meta as any).env && (import.meta as any).env.BASE_URL) || '/';
const logo = `${BASE_URL}ACM_LOGO.png`;

// The parseCSV function is needed again to process the file
const parseCSV = (csvText: string): any[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
};

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [organizers, setOrganizers] = useState<any[]>([]);

  // useEffect is added back to fetch the Organizers.csv file on component load
  useEffect(() => {
    const loadOrganizers = async () => {
      try {
  const response = await fetch(`${BASE_URL}Organizers.csv`);
        if (response.ok) {
          const organizersText = await response.text();
          setOrganizers(parseCSV(organizersText));
        } else {
          console.error("Failed to fetch Organizers.csv");
        }
      } catch (err) {
        console.error("Error loading Organizers.csv", err);
      }
    };
    loadOrganizers();
  }, []);

  // handleSubmit now checks the email against the state populated from the CSV
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const organizer = organizers.find(o => o.email && o.email.toLowerCase() === email.trim().toLowerCase());

    if (organizer) {
      onLogin({
        id: email.split('@')[0],
        email: email,
        role: 'organizer',
        name: organizer.name || email.split('@')[0],
      });
    } else {
      setError('Organizer not found or not authorized.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gfg-gradient-start to-gfg-gradient-end">
      <NeuralBackground />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="mb-4">
            <AnimatedLogo src={logo} size={96} />
          </div>
          <p className="text-blue-500 text-lg font-body uppercase tracking-widest mb-2">acmkare / ACM PRESENTS</p>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gfg-text-light font-heading mb-4 tracking-tight">
            HACKARE <span className="bg-gfg-accent text-gfg-text-light px-2 py-1 leading-none inline-block">3.0</span>
          </h1>
          <p className="text-blue-500 text-lg font-body uppercase tracking-widest mb-2">ATTENDANCE SYSTEM</p>
        </div>
        <div className="bg-gfg-card-bg rounded-lg shadow-2xl border border-gfg-border overflow-hidden">
          <div className="bg-gradient-to-r from-gfg-red to-gfg-red-hover p-4">
            <h2 className="text-xl font-bold text-blue-500 text-center font-heading tracking-widest">ORGANIZER ACCESS</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-body font-medium text-blue-500 mb-2 tracking-wide">ORGANIZER EMAIL</label>
              <input
                type="email" id="email" value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gfg-dark-bg border border-gfg-border rounded-lg text-gfg-text-light placeholder-gfg-text-dark focus:border-gfg-gold focus:ring-1 focus:ring-gfg-gold outline-none transition-colors"
                placeholder="your_regno@klu.ac.in"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="flex items-center space-x-2 text-gfg-gold bg-gfg-gold/10 p-3 rounded-lg border border-gfg-gold/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-body">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue hover:bg-gray-100 text-gfg-text-dark border border-gfg-border py-3 px-4 rounded-lg font-bold font-heading hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gfg-gold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'VERIFYING...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

