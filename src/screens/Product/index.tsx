import React, { useState, useEffect } from 'react';
import { Platform, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage'
import { useNavigation, useRoute } from '@react-navigation/native';

import { ProductNavigationProps } from '../../@types/navigation';
import { ProductProps } from '../../components/ProductCard';

import { ButtonBack } from '../../components/ButtonBack';
import { InputPrice } from '../../components/InputPrice';
import { Photo } from '../../components/Photo';
import { Input } from '../../components/input';
import { Button } from '../../components/Button';

import {
  Container,
  Header,
  Title,
  DeleteLabel,
  Upload,
  PickImageButton,
  Label,
  InputGroup,
  InputGroupHeader,
  MaxCaracters,
  Form
} from './styles'

type PizzaResponse = ProductProps & {
  photo_path: string,
  prices_sizes: {
    p: string,
    m: string,
    g: string,
  }
}

export function Product() {
  const [photoPath, setPhotoPath] = useState('');
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceP, setPriceP] = useState('');
  const [priceM, setPriceM] = useState('');
  const [priceG, setPriceG] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as ProductNavigationProps;

  async function handlePickerImage() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4]
      });

      if (!result.cancelled) {
        setImage(result.uri);
      }
    }
  }

  async function handleAdd() {
    if(!name.trim()) {
      return Alert.alert('Oops...', 'Por favor, preencha o nome do produto.');
    }
    if(!description.trim()){
      return Alert.alert('Oops...', 'Por favor, preencha a descrição do produto.');
    }
    if(!image){
      return Alert.alert('Oops...', 'Por favor, selecione uma imagem.');
    }
    if(!priceP || !priceM || !priceG){
      return Alert.alert('Oops...', 'Por favor, preencha todos os preços do produto.');
    }
    setIsLoading(true);

    const fileName = new Date().getTime();
    const reference = storage().ref(`/pizzas/${fileName}.png`);

    await reference.putFile(image);
    const photo_url = await reference.getDownloadURL();

    firestore().collection('pizzas')
    .add({
      name,
      name_insensitive: name.toLowerCase().trim(),
      description,
      prices_sizes: {
        p: priceP,
        m: priceM,
        g: priceG
      },
      photo_url,
      photo_path: reference.fullPath
    })
    .then(() => navigation.navigate('home'))
    .catch(() => {
      setIsLoading(false);
      Alert.alert('Oops...', 'Ocorreu um erro ao adicionar o produto.')
    })


  }

  function handleGoBack() {
    navigation.goBack();
  }

  function handleDelete() {
    firestore().collection('pizzas').doc(id).delete().then(() => {
      storage().ref(photoPath).delete().then(() => {
        navigation.navigate('home');
      })
    })
  }

  useEffect(() => {
    if(id){
      firestore().collection('pizzas').doc(id).get()
      .then(response => {
        const data = response.data() as PizzaResponse;
        setName(data.name);
        setDescription(data.description);
        setImage(data.photo_url);
        setPriceP(data.prices_sizes.p);
        setPriceM(data.prices_sizes.m);
        setPriceG(data.prices_sizes.g);
        setPhotoPath(data.photo_path);
      })
      .catch(error => Alert.alert('Oops...', 'Não foi possível carregar o produto.'));
    }
  }, [id]);

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Header>
          <ButtonBack onPress={handleGoBack} />
          <Title>Cadastrar</Title>
          { 
            id ?
            <TouchableOpacity onPress={handleDelete}>
              <DeleteLabel>Deletar</DeleteLabel>
            </TouchableOpacity>
            : 
            <View style={{ width: 20 }} />
          }
        </Header>

        <Upload>
          <Photo uri={image} />
          {
            !id &&
            <PickImageButton
            onPress={handlePickerImage}
            title="Carregar"
            type="secondary"
          />}
        </Upload>

        <Form>
          <InputGroup>
            <Label>Nome</Label>
            <Input onChangeText={setName} value={name} />
          </InputGroup>

          <InputGroup>
            <InputGroupHeader>
              <Label>Descrição</Label>
              <MaxCaracters>0 de 60 caracteres</MaxCaracters>
            </InputGroupHeader>
            <Input
              multiline
              maxLength={60}
              style={{ height: 80 }}
              onChangeText={setDescription}
              value={description}
            />
          </InputGroup>

          <InputGroup>
          <Label>Tamanhos e preços</Label>
          <InputPrice size="P"  onChangeText={setPriceP} value={priceP} />
          <InputPrice size="M" onChangeText={setPriceM} value={priceM} />
          <InputPrice size="G" onChangeText={setPriceG} value={priceG} />
          </InputGroup>
          
          {
            !id &&
            <Button 
              title="Cadastrar Pizza" 
              isLoading={isLoading}
              onPress={handleAdd}
            />
          }
        </Form>
      </ScrollView>
    </Container>
  )
}
