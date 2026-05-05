<template>
  <div class="max-w-md mx-auto mt-20 p-6 border border-white/20 rounded shadow">
    <p class="text-2xl font-bold mb-4">Register</p>

    <form @submit="onSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="username">Username</label>
        <InputText id="username" v-model="username" type="text" />
        <span class="text-sm text-red-500">{{ errors.username }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <label for="password">Password</label>
        <InputText id="password" v-model="password" type="password" />
        <span class="text-sm text-red-500">{{ errors.password }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" />
        <span class="text-sm text-red-500">{{ errors.email }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <label>Role</label>
        <div class="flex gap-3">
          <div class="flex gap-2 items-center">
            <RadioButton inputId="user" v-model="role" value="USER" />
            <label for="user">USER</label>
          </div>
          <div class="flex gap-2 items-center">
            <RadioButton inputId="admin" v-model="role" value="ADMIN" />
            <label for="admin">ADMIN</label>
          </div>
        </div>
        <span class="text-sm text-red-500">{{ errors.role }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <Button type="submit" label="Register" class="font-bold" />
        <div class="flex gap-1.5 mt-2 text-sm">
          Already have an account?
          <p class="underline cursor-pointer" @click="navigateToLogin">Login here.</p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { InputText, Button, RadioButton } from "primevue";
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useAuthStore } from "@/shared";

const router = useRouter();
const { register } = useAuthStore();

const validationSchema = toTypedSchema(
  z.object({
    username: z
      .string({ message: "Username is required." })
      .min(3, { message: "Username needs to be at least 3 characters." }),
    password: z
      .string({ message: "Password is required." })
      .min(3, { message: "Password needs to be at least 3 characters." }),
    email: z
      .string({ message: "Email is required." })
      .email({ message: "Enter a valid email." }),
    role: z.enum(["USER", "ADMIN"], {
      required_error: "Choose a role.",
    }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    username: "",
    password: "",
    email: "",
    role: "USER",
  },
});

const { value: username } = useField("username");
const { value: password } = useField("password");
const { value: email } = useField("email");
const { value: role } = useField("role");

const onSubmit = handleSubmit((values) => {
  register(values);
});

function navigateToLogin() {
  router.push("/login");
}
</script>
