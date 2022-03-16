import React, { useEffect, useState, useCallback } from "react";
import { Alert, FlatList, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from "styled-components/native";
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../hooks/auth";
import happyEmoji from '../../assets/happy.png';
import { Search } from "../../components/Search";
import { ProductCard, ProductProps } from "../../components/ProductCard";


import {
  Container,
  Header,
  Greeting,
  GreetingEmoji,
  GreetingText,
  MenuHeader,
  MenuItemsNumber,
  Title,
  NewProductButton
} from "./styles";

export function Home() {
  const { COLORS } = useTheme();
  const [search, setSearch] = useState('');
  const [pizzas, setPizzas] = useState<ProductProps[]>([]);
  const navigation = useNavigation();
  const { signOut, user } = useAuth();

  function fetchPizzas(value: string) {
    const formattetValue = value.toLowerCase().trim();

    firestore()
      .collection('pizzas')
      .orderBy('name_insensitive')
      .startAt(formattetValue)
      .endAt(`${formattetValue}\uf8ff`)
      .get()
      .then(response => {
        const data = response.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          }
        }) as ProductProps[];

        setPizzas(data);
      })
      .catch(error => Alert.alert('Ops...', 'Não foi possível carregar as pizzas'));
  }

  const handleSearch = () => {
    fetchPizzas(search);
  }

  const handleClear = () => {
    fetchPizzas('');
    setSearch('');
  }

  const handleOpen = (id: string) => {
    const route = user?.isAdmin ? 'product' : 'order';
    navigation.navigate(route, { id });
  }

  const handleAdd = () => {
    navigation.navigate('product', {});
  }

  useFocusEffect(
    useCallback(() => {
      fetchPizzas('');
    }, [])
  );

  return (
    <Container>

      <Header>
        <Greeting>
          <GreetingEmoji source={happyEmoji} />
          <GreetingText>Olá, {user?.name}</GreetingText>
        </Greeting>

        <TouchableOpacity onPress={signOut}>
          <MaterialIcons name="logout" size={24} color={COLORS.TITLE} />
        </TouchableOpacity>
      </Header>

      <Search onChangeText={setSearch} value={search} onSearch={handleSearch} onClear={handleClear} />

      <MenuHeader>
        <Title>Cardápio</Title>
        <MenuItemsNumber>{pizzas.length} pizzas</MenuItemsNumber>
      </MenuHeader>

      <FlatList
        data={pizzas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            data={item}
            onPress={() => handleOpen(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 125, marginHorizontal: 24 }}
      />
      {
        user?.isAdmin && 
        <NewProductButton
          title="Cadastrar pizza"
          type="secondary"
          onPress={handleAdd}
        />
      }
    </Container>
  );
}
