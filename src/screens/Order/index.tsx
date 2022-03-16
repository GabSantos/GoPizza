import React, { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import firestore from '@react-native-firebase/firestore';

import { RadioButton } from "../../components/RadioButton";
import { Input } from "../../components/input";
import { Button } from "../../components/Button";
import { ButtonBack } from "../../components/ButtonBack";
import { PIZZA_TYPES } from "../../utils/pizzaTypes";
import { OrderNavigationProps } from "../../@types/navigation";
import { ProductProps } from "../../components/ProductCard";
import { useAuth } from "../../hooks/auth";

import {
  Container,
  Form,
  FormRow,
  Header,
  InputGroup,
  Label,
  Photo,
  Sizes,
  Title,
  Price,
  ScrollView
} from "./styles";

type PizzaResponse = ProductProps & {
  prices_sizes: {
    [key: string]: number
  }
}

export function Order() {
  const [size, setSize] = useState('');
  const [pizza, setPizza] = useState<PizzaResponse>({} as PizzaResponse);
  const [quantity, setQuantity] = useState(0);
  const [tableNumber, setTableNumber] = useState('');
  const [sendingOrder, setSendingOrder] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as OrderNavigationProps;
  const { user } = useAuth();

  const amount = size && quantity ? pizza.prices_sizes[size] * quantity : '0,00';

  async function handleOrder() { 
    if(!size) {
      return Alert.alert('Pedido','Escolha o tamanho da pizza');
    }
    if(!tableNumber) {
      return Alert.alert('Pedido','Informe o numero da mesa');
    }
    if(!quantity) {
      return Alert.alert('Pedido','Informe a quantidade');
    }

    setSendingOrder(true);

    firestore().collection('orders').add({
      quantity,
      amount,
      pizza: pizza.name,
      size,
      table_number: tableNumber,
      status: 'Preparando',
      waiter_id: user?.id,
      image: pizza.photo_url
    }).then(() => {
      navigation.navigate('home');
    }).catch(() => {
      Alert.alert('Pedido','Erro ao enviar pedido');
      setSendingOrder(false);
    })
  }

  useEffect(() => {
    if(id) {
      firestore().collection('pizzas').doc(id).get().then(response => {
        setPizza(response.data() as PizzaResponse);
      }).catch(() => {
        Alert.alert('Ops...', 'Não foi possível carregar a pizza');
      })
    }
  }, [id]);

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
      <ScrollView>
        <Header>
          <ButtonBack
            onPress={() => navigation.goBack()}
            style={{ marginBottom: 108 }}
          />
        </Header>

        <Photo source={{ uri: pizza.photo_url }} />

        <Form>
          <Title>{pizza.name}</Title>
          <Label>Selecione um tamanho</Label>
          <Sizes>
            {
              PIZZA_TYPES.map(item => (

                <RadioButton
                  key={item.id}
                  title={item.name}
                  selected={size === item.id}
                  onPress={() => setSize(item.id)}
                />
              ))
            }
          </Sizes>
          <FormRow>
            <InputGroup>
              <Label>Número da mesa</Label>
              <Input keyboardType="numeric" onChangeText={setTableNumber} />
            </InputGroup>

            <InputGroup>
              <Label>Quantidade</Label>
              <Input keyboardType="numeric" onChangeText={value => setQuantity(Number(value))} />
            </InputGroup>
          </FormRow>

          <Price>R$ {amount}</Price>
          <Button
            title="Confirmar pedido"
            onPress={handleOrder}
            isLoading={sendingOrder}
          />
        </Form>
      </ScrollView>
    </Container>
  );
}