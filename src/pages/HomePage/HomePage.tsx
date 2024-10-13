import React, { useContext } from 'react'
import { ThemeContext } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next';

const HomePage = () => {

  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('ThemeContext must be used within a ThemeProvider');
  }
  const { theme } = context;

  const {t} = useTranslation()

  const srcGenerator = (prefix:string, variable:string, suffix:string) => {
    return `/assets/${prefix}${variable}${suffix}`
  }

  return (
    <div className='pl-4 pr-4 w-full h-full grid grid-cols-6 grid-flow-row grid-rows-4 gap-2 justify-center place-content-center place-items-center place-self-center'>
      <div className='font-serif'>
        <p className='text-3xl'>这是一个药盒，</p>
        <p>一个透明、止痛、安全的容器。</p>
      </div>
      <div className='overflow-hidden row-start-2 row-span-2 col-span-1'>
        <img src={srcGenerator('dev-',theme,'.jpg')} alt={t('开发者')} className='object-cover'/>
      </div>
      <div className={
        `grid row-span-4 col-start-4 col-end-6 gap-2 overflow-auto w-full h-full grid-cols-2
        ${theme === 'dark' ? 'bg-neutral-400' : 'bg-neutral-800'}`
      }>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
      </div>
      
    </div>
  )
}

export default HomePage