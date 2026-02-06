'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Shield, Users, TrendingUp, Lock, Zap, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'Anonymous & Secure',
      description: 'Your identity is protected through cryptographic secret keys. Vote freely without fear.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Truth is determined by the collective wisdom of students, not by admins.',
    },
    {
      icon: TrendingUp,
      title: 'Reputation Based',
      description: 'Build your reputation through accurate votes. Higher reputation means more influence.',
    },
    {
      icon: Lock,
      title: 'Immutable Records',
      description: 'All finalized decisions are locked using blockchain-style hash chaining.',
    },
    {
      icon: Zap,
      title: 'AI Moderation',
      description: 'AI validates posts and moderates voting to prevent statistical anomalies.',
    },
    {
      icon: CheckCircle,
      title: 'Fair Voting',
      description: 'Area-weighted voting ensures those with direct knowledge have more say.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-white to-gray-50 dark:from-gray-900/50 dark:via-black dark:to-gray-950" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white">
              Vera<span className="text-blue-600 dark:text-blue-400">Node</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4">
              AI-Powered Anonymous Campus Rumor System
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Post rumors anonymously. Vote on their truthfulness. No central authority, No manipulation, Just facts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Alternating Layout */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Use VeraNode?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Powerful features for transparent truth discovery
            </p>
          </div>

          <div className="space-y-20">
            {/* Pair features in groups of 2 */}
            {[0, 2, 4].map((startIndex) => {
              const leftFeature = features[startIndex];
              const rightFeature = features[startIndex + 1];
              const LeftIcon = leftFeature.icon;
              const RightIcon = rightFeature.icon;
              const isEvenRow = startIndex % 4 === 0;

              return (
                <div key={startIndex} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Left Card */}
                  <ScrollReveal
                    direction={isEvenRow ? "left" : "right"}
                    delay={0.1}
                    triggerOnce={false}
                  >
                    <div className="p-8 bg-white/30 dark:bg-gray-900/20 backdrop-blur-sm rounded-lg">
                      <div className="w-14 h-14 bg-blue-600/80 dark:bg-blue-500/70 rounded-lg flex items-center justify-center mb-5">
                        <LeftIcon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {leftFeature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        {leftFeature.description}
                      </p>
                    </div>
                  </ScrollReveal>

                  {/* Right Feature */}
                  <ScrollReveal
                    direction={isEvenRow ? "right" : "left"}
                    delay={0.2}
                    triggerOnce={false}
                  >
                    <div className="p-8 bg-white/30 dark:bg-gray-900/20 backdrop-blur-sm rounded-lg">
                      <div className="w-14 h-14 bg-blue-600/80 dark:bg-blue-500/70 rounded-lg flex items-center justify-center mb-5">
                        <RightIcon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {rightFeature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        {rightFeature.description}
                      </p>
                    </div>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A simple, transparent process for truth discovery
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Post a Rumor',
                description: 'Submit anonymous rumors about campus events. AI validates that it\'s actually a rumor, not a fact.',
              },
              {
                step: '2',
                title: 'Community Votes',
                description: 'Students vote FACT or LIE. Votes are weighted by reputation and area proximity.',
              },
              {
                step: '3',
                title: 'Voting Locks',
                description: 'After a timer expires and minimum thresholds are met, voting locks automatically.',
              },
              {
                step: '4',
                title: 'Truth Revealed',
                description: 'The system calculates the final decision. Points are awarded or deducted. Results are immutable.',
              },
            ].map((item, index) => (
              <ScrollReveal
                key={item.step}
                delay={index * 0.15}
                direction="right"
                triggerOnce={false}
              >
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <ScrollReveal direction="up" triggerOnce={false}>
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-blue-600 dark:bg-blue-500 rounded-2xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Discover the Truth?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join VeraNode today and be part of a transparent community.
              </p>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
