package com.kevzz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@SpringBootApplication
@EnableWebMvc
public class NeuralNetworkApplication {

	public static void main(String[] args) {
		SpringApplication.run(NeuralNetworkApplication.class, args);
	}

}
