import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreateSellerProfile,
  getGetSellerProfileQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Store } from "lucide-react";

const formSchema = z.object({
  displayName: z.string().min(2, "Display name is required"),
  sellerType: z.enum(["forager", "commercial_supplier", "restaurant", "individual"]),
  bio: z.string().optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SellerOnboarding() {
  const createProfile = useCreateSellerProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      sellerType: "individual",
      bio: "",
      location: "",
      imageUrl: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createProfile.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSellerProfileQueryKey() });
          toast({ title: "Seller profile created!", description: "You can now list truffles on TruffleNation" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create seller profile", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-secondary/15 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-3">Become a Seller</h2>
        <p className="text-muted-foreground leading-relaxed">
          Join a community of foragers, cultivators, and truffle houses. Create your seller profile to start listing premium truffles on TruffleNation.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border border-border bg-card p-8">
          <FormField control={form.control} name="displayName" render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-display-name" className="rounded-none" placeholder="e.g. Périgord Heritage Truffles" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="sellerType" render={({ field }) => (
            <FormItem>
              <FormLabel>Seller Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-seller-type" className="rounded-none"><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="forager">Forager — Wild-harvested truffles</SelectItem>
                  <SelectItem value="commercial_supplier">Commercial Supplier — Farm or wholesale</SelectItem>
                  <SelectItem value="restaurant">Restaurant — Seasonal surplus</SelectItem>
                  <SelectItem value="individual">Individual — Private sales</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-location" className="rounded-none" placeholder="e.g. Dordogne, France" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} data-testid="textarea-bio" className="rounded-none min-h-[100px]" placeholder="Tell buyers about your background, your sources, your approach to quality..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button
            data-testid="button-create-seller-profile"
            type="submit"
            className="w-full rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 py-5 font-semibold"
            disabled={createProfile.isPending}
          >
            {createProfile.isPending ? "Creating Profile..." : "Create Seller Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
