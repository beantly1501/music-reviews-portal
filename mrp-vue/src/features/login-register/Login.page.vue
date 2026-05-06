<template>
  <div class="flex items-center justify-center h-screen -my-[1rem] -mx-[2.5rem]">
  <div class="max-w-md w-full p-6 border border-white/20 rounded shadow">
    <p class="text-2xl font-bold mb-4">Login</p>

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

      <div class="flex flex-col gap-1">
        <Button type="submit" label="Login" class="font-bold" />
        <div class="flex gap-1.5 mt-2 text-sm">
          Don't have an account?
          <p class="underline cursor-pointer" @click="navigateToRegister">Register here.</p>
        </div>
      </div>
    </form>
  </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { InputText, Button } from "primevue";
import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { useAuthStore } from "@/shared";

const router = useRouter();
const { login } = useAuthStore();

const validationSchema = toTypedSchema(
  z.object({
    username: z
      .string({ message: "Username is required." })
      .min(3, { message: "Username needs to be at least 3 characters." }),
    password: z
      .string({ message: "Password is required." })
      .min(3, { message: "Password needs to be at least 3 characters." }),
  }),
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const { value: username } = useField("username");
const { value: password } = useField("password");

const onSubmit = handleSubmit((values) => {
  login(values);
});

function navigateToRegister() {
  router.push("/register");
}
</script>
