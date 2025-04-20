"use client";

import React, {useState} from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/schemas';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import CardWrapper from '@/components/auth/card-wrapper';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function LoginForm() {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false, 
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = () => {
    console.log("Login data:");
    // authentication will go logic here, including handling data.remember
  };

  return (
    <CardWrapper headerLabel="Fill in your unique administrator details to sign in">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email address or Username"
                      className="bg-input w-[513px] h-[53px]"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           <FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <div className="relative"> 
          <Input
            {...field}
            placeholder="Password"
            className="bg-input pr-10 w-[513px] h-[53px]" 
            type={showPassword ? 'text' : 'password'} 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
          >
            {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
          </button>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="remember" 
                            className="shadcn-checkbox peer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"/>
                        </FormControl>
                        <Label htmlFor="remember" className="text-sm font-normal">
                          Stay signed in
                        </Label>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                />
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-[513px] h-[53px]">
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}

export default LoginForm;